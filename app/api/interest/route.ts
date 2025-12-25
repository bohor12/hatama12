import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/permissions';

export async function POST(req: NextRequest) {
  try {
    const sender = await getCurrentUser();
    if (!sender) {
      return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    }
    const senderId = sender.id;

    const body = await req.json();
    const { receiverId, allowMessage, inviteMessage } = body;

    if (!receiverId) {
      return NextResponse.json({ error: 'Manjkajoči podatki' }, { status: 400 });
    }

    if (senderId === receiverId) {
      return NextResponse.json({ error: 'Ne morete si poslati zanimanja' }, { status: 400 });
    }

    // Check if the other person has already shown interest in us
    const mutualInterest = await prisma.interest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: receiverId,
          receiverId: senderId,
        },
      },
    });

    if (mutualInterest) {
      // It's a match! Both have interest, update both to APPROVED
      const [updatedInterest, newInterest] = await prisma.$transaction([
        prisma.interest.update({
          where: { id: mutualInterest.id },
          data: { status: 'APPROVED' },
        }),
        prisma.interest.create({
          data: {
            senderId: senderId,
            receiverId: receiverId,
            status: 'APPROVED',
            allowMessage: allowMessage || false,
            inviteMessage: inviteMessage || null,
          } as any,
        }),
      ]);
      return NextResponse.json({ message: "It's a match!", match: true, interest: newInterest });
    } else {
      // It's a one-way interest, create it if it doesn't exist
      const existingInterest = await prisma.interest.findUnique({
        where: {
          senderId_receiverId: { senderId, receiverId },
        },
      });

      if (existingInterest) {
        return NextResponse.json({ error: 'Zanimanje že poslano' }, { status: 400 });
      }

      const interest = await prisma.interest.create({
        data: {
          senderId,
          receiverId,
          status: 'PENDING',
          allowMessage: allowMessage || false,
          inviteMessage: inviteMessage || null,
        } as any,
      });

      // Return different message based on whether invite was sent
      const message = allowMessage
        ? "Like poslano s povabilom!"
        : "Like poslano!";

      return NextResponse.json({ message, match: false, interest });
    }
  } catch (error) {
    console.error("Interest API Error:", error);
    return NextResponse.json({ error: 'Napaka na strežniku' }, { status: 500 });
  }
}

// Get interests sent TO me (for notifications/approvals page)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    }
    const userId = user.id;

    const interests = await prisma.interest.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: {
        sender: {
          select: { id: true, name: true, photos: true, gender: true, isVerified: true },
        },
      },
    });

    return NextResponse.json(interests);
  } catch (error) {
    console.error("Get Interests Error:", error);
    return NextResponse.json({ error: 'Napaka na strežniku' }, { status: 500 });
  }
}
