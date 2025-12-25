import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-this";

export async function POST(req: NextRequest) {
    try {
        // Get user from token
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const body = await req.json();
        const { photo } = body;

        // Basic validation - check if photo data exists and has reasonable size
        if (!photo || photo.length < 5000) {
            return NextResponse.json({ error: "Invalid photo data" }, { status: 400 });
        }

        // In a real scenario, you would:
        // 1. Save the photo to storage
        // 2. Run face detection via face-api.js on server or external API
        // 3. Check for liveness indicators
        // For now, we just mark as verified (the "fear factor" is the UI itself)

        // Update user as verified
        await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                isVerified: true,
                verificationStatus: "APPROVED"
            }
        });

        return NextResponse.json({ success: true, message: "Verification complete" });

    } catch (error) {
        console.error("Auto-verify error:", error);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
