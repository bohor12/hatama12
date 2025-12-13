import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const viewerId = decoded.userId;

    // Fetch the viewer to check their attributes (age, height, habits)
    const viewer = await prisma.user.findUnique({
      where: { id: viewerId },
    });

    if (!viewer) return NextResponse.json({ error: 'Uporabnik ne obstaja' }, { status: 401 });

    // Calculate Viewer's Age
    let viewerAge = 0;
    if (viewer.birthDate) {
        const diff = Date.now() - new Date(viewer.birthDate).getTime();
        viewerAge = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }

    // Fetch ALL potential candidates (excluding self)
    // Optimization: We could filter partially in DB, but filter logic for "Show users whose filters allow ME" 
    // is complex to do purely in SQL/Prisma without raw queries, so we fetch and filter in code for MVP.
    const candidates = await prisma.user.findMany({
        where: {
            NOT: { id: viewerId },
            // Basic optimization: if viewer is Male, maybe he mostly wants Females? 
            // But let's keep it open for now or filter by 'lookingFor' if implemented.
        },
        include: {
            filter: true
        }
    });

    // Filter Logic:
    // Only return candidates where the VIEWERS attributes satisfy the CANDIDATE'S filter.
    const visibleCandidates = candidates.filter(candidate => {
        const filter = candidate.filter;
        if (!filter) return true; // No filter, visible to everyone

        // 1. Smoker Check
        if (filter.mustNotSmoke && viewer.isSmoker) return false;

        // 2. Height Check
        if (filter.minHeight && (!viewer.height || viewer.height < filter.minHeight)) return false;

        // 3. Age Check
        // If candidate has age requirements, viewer MUST have birthDate
        if (filter.minAge || filter.maxAge) {
            if (!viewer.birthDate) return false; // Fail-closed
            if (filter.minAge && viewerAge < filter.minAge) return false;
            if (filter.maxAge && viewerAge > filter.maxAge) return false;
        }

        return true;
    });

    // Remove sensitive data
    const safeCandidates = visibleCandidates.map(c => {
        const { password, email, ...rest } = c;
        return rest;
    });

    return NextResponse.json(safeCandidates);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Napaka na strežniku' }, { status: 500 });
  }
}
