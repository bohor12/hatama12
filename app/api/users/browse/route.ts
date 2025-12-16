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

    const where: any = {
      NOT: { id: user.id }
    };

    if (gender === 'M' || gender === 'F') {
      where.gender = gender;
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
  } catch (error) {
    console.error("Browse error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
