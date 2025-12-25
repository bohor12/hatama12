import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/permissions';

export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });

        // Use existing fields from schema for now - cast to any to handle new fields
        const user = currentUser as any;
        const myTags: string[] = user.tagsSelf ? user.tagsSelf.split(',') : [];
        const lookingForTags: string[] = user.tagsLookingFor ? user.tagsLookingFor.split(',') : [];
        const minAge: number = user.ageRangeMin || 18;
        const maxAge: number = user.ageRangeMax || 99;
        const myRegion: string | null = user.region || null;

        // Fetch potential candidates
        const potentialMatches = await prisma.user.findMany({
            where: {
                id: { not: currentUser.id },
            },
        });

        // Cast to any for new fields access
        const scoredMatches = potentialMatches.map((candidate: any) => {
            let score = 0;
            const candidateTags: string[] = candidate.tagsSelf ? candidate.tagsSelf.split(',') : [];
            const candidateLookingFor: string[] = candidate.tagsLookingFor ? candidate.tagsLookingFor.split(',') : [];
            const candidateRegion: string | null = candidate.region || null;

            // A) Does candidate match what I want?
            const myWantsMatch = lookingForTags.filter((tag: string) => candidateTags.includes(tag)).length;
            score += myWantsMatch * 10;

            // B) Do I match what candidate wants? (Bidirectional)
            const candidateWantsMatch = candidateLookingFor.filter((tag: string) => myTags.includes(tag)).length;
            score += candidateWantsMatch * 10;

            // C) Location Bonus (Big Boost)
            if (myRegion && candidateRegion && myRegion === candidateRegion) {
                score += 30; // High value for same region
            }

            // D) Bonus: Specific Dynamics
            if (myTags.includes("Mlad") && lookingForTags.includes("Starejša") &&
                candidateTags.includes("Starejša") && candidateLookingFor.includes("Mlad")) {
                score += 50;
            }

            if (myTags.includes("Starejši") && lookingForTags.includes("Mlajša") &&
                candidateTags.includes("Mlajša") && candidateLookingFor.includes("Starejši")) {
                score += 50;
            }

            return {
                id: candidate.id,
                name: candidate.name,
                photos: candidate.photos,
                bio: candidate.bio,
                tagsSelf: candidate.tagsSelf,
                region: candidateRegion, // Send backend region to frontend
                score,
                mutualTags: myWantsMatch + candidateWantsMatch
            };
        });

        // Sort by Score and return top 10
        const bestMatches = scoredMatches
            .filter(m => m.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        return NextResponse.json(bestMatches);

    } catch (error) {
        console.error("Matching Algo Error:", error);
        return NextResponse.json({ error: 'Napaka strežnika' }, { status: 500 });
    }
}
