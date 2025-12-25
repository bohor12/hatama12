import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/permissions';

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });

        const body = await req.json();
        const { tagsSelf, tagsLookingFor, ageRangeMin, ageRangeMax, region } = body;

        // Use raw query or cast to update new fields
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                tagsSelf,
                tagsLookingFor,
                ageRangeMin,
                ageRangeMax,
                region
            } as any // Cast to any until Prisma types are regenerated
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Save Prefs Error:", error);
        return NextResponse.json({ error: 'Napaka strežnika' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });

        // Return current user data - cast to any for new fields
        const currentUser = await prisma.user.findUnique({
            where: { id: user.id },
        }) as any;

        return NextResponse.json({
            tagsSelf: currentUser?.tagsSelf || null,
            tagsLookingFor: currentUser?.tagsLookingFor || null,
            ageRangeMin: currentUser?.ageRangeMin || 18,
            ageRangeMax: currentUser?.ageRangeMax || 99,
            region: currentUser?.region || null
        });
    } catch (error) {
        return NextResponse.json({ error: 'Napaka strežnika' }, { status: 500 });
    }
}
