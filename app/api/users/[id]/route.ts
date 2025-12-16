import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;

    // 1. Fetch the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        gender: true,
        birthDate: true,
        height: true,
        location: true,
        bio: true,
        photos: true,
        lookingFor: true,
        interests: true,
        isSmoker: true,
        // Exclude private info like email, password, etc.
      }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Uporabnik ne obstaja" }, { status: 404 });
    }

    // 2. Check Auth Status (Optional but needed for 'interaction' status)
    let currentUserId: string | null = null;
    const token = req.cookies.get('token')?.value;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        currentUserId = decoded.userId;
      } catch (e) {
        // Invalid token, treat as guest
      }
    }

    // 3. Determine Interaction Status
    let interactionStatus = 'NONE'; // NONE, PENDING, APPROVED
    let canMessage = false;

    if (currentUserId && currentUserId !== targetUserId) {
        // Check if I sent interest or received interest
        const interest = await prisma.interest.findFirst({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: targetUserId },
                    { senderId: targetUserId, receiverId: currentUserId }
                ]
            }
        });

        if (interest) {
            interactionStatus = interest.status; // PENDING, APPROVED, REJECTED

            // If I am the sender and it's PENDING -> PENDING
            // If I am the receiver and it's PENDING -> RECEIVED (But we can just say PENDING/WAITING)

            // For simplicity:
            if (interest.status === 'APPROVED') {
                canMessage = true;
            }
        }
    }

    return NextResponse.json({
        ...targetUser,
        interaction: {
            status: interactionStatus,
            canMessage
        }
    });

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Napaka strežnika" }, { status: 500 });
  }
}
