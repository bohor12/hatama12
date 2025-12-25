import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const gender = searchParams.get('gender');
    const region = searchParams.get('region');
    const ageMin = searchParams.get('ageMin');
    const ageMax = searchParams.get('ageMax');
    const heightMin = searchParams.get('heightMin');
    const hasPhoto = searchParams.get('hasPhoto');

    const where: any = {
      NOT: { id: user.id }
    };

    // Gender Filter
    if (gender === 'M' || gender === 'F') {
      where.gender = gender;
    }

    // Region Filter - check both 'region' and 'location' fields for compatibility
    if (region) {
      // Map region codes to possible location strings
      const regionLocationMap: Record<string, string[]> = {
        "Osrednjeslovenska": ["Ljubljana", "Kranj", "Domžale", "Kamnik"],
        "Podravska": ["Maribor", "Ptuj", "Slovenska Bistrica"],
        "Savinjska": ["Celje", "Velenje", "Žalec"],
        "Gorenjska": ["Kranj", "Bled", "Radovljica", "Jesenice"],
        "Obalno-kraška": ["Koper", "Piran", "Izola", "Portorož", "Sežana"],
        "Goriška": ["Nova Gorica", "Tolmin", "Ajdovščina"],
        "Pomurska": ["Murska Sobota", "Lendava", "Ljutomer"],
        "Jugovzhodna": ["Novo Mesto", "Trebnje", "Črnomelj"],
        "Koroška": ["Slovenj Gradec", "Ravne", "Dravograd"],
        "Zasavska": ["Trbovlje", "Zagorje", "Hrastnik"],
        "Posavska": ["Krško", "Brežice", "Sevnica"],
        "Notranjska": ["Postojna", "Pivka", "Cerknica", "Ilirska Bistrica"],
      };

      const locationKeywords = regionLocationMap[region] || [region];

      where.OR = [
        { region: region },
        { location: { in: locationKeywords } },
        ...locationKeywords.map(keyword => ({ location: { contains: keyword } }))
      ];
    }

    // Age Filter (Calculate date range from birthDate)
    const today = new Date();
    if (ageMin || ageMax) {
      const min = ageMin ? parseInt(ageMin) : 18;
      const max = ageMax ? parseInt(ageMax) : 99;

      const minDate = new Date(today.getFullYear() - max - 1, today.getMonth(), today.getDate());
      const maxDate = new Date(today.getFullYear() - min, today.getMonth(), today.getDate());

      where.birthDate = {
        gte: minDate,
        lte: maxDate
      };
    }

    // Height Filter
    if (heightMin) {
      where.height = {
        gte: parseInt(heightMin)
      };
    }

    // Photo Filter
    if (hasPhoto === 'true') {
      where.photos = {
        not: '[]'
      };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        gender: true,
        birthDate: true,
        location: true,
        bio: true,
        photos: true,
        lookingFor: true,
        interests: true,
        height: true,
      },
      take: 50
    });

    return NextResponse.json(users);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error("Browse error:", message);
    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}
