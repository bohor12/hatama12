import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const senderId = decoded.userId;

    const body = await req.json();
    const { receiverId, content } = body;

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Manjkajoči podatki' }, { status: 400 });
    }

    // Get sender info
    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    if (!sender) {
      return NextResponse.json({ error: 'Uporabnik ne obstaja' }, { status: 404 });
    }

    // Determine folder (PRIMARY or OTHERS)
    let folder = 'OTHERS';

    // Check 1: Did receiver send interest to sender with allowMessage = true? → PRIMARY
    const receiverInvite = await prisma.interest.findUnique({
      where: {
        senderId_receiverId: { senderId: receiverId, receiverId: senderId }
      }
    });

    if ((receiverInvite as any)?.allowMessage || receiverInvite?.status === 'APPROVED') {
      folder = 'PRIMARY';
    }

    // Check 2: Did sender receive interest from receiver (any status)? Mutual interest = PRIMARY
    const senderInterest = await prisma.interest.findUnique({
      where: {
        senderId_receiverId: { senderId: senderId, receiverId: receiverId }
      }
    });

    if (senderInterest?.status === 'APPROVED') {
      folder = 'PRIMARY';
    }

    // Check 3: Has there been previous conversation (either direction)? → PRIMARY
    const previousMessage = await prisma.message.findFirst({
      where: {
        OR: [
          { senderId: receiverId, receiverId: senderId },
          { senderId: senderId, receiverId: receiverId }
        ]
      } as any
    });

    if (previousMessage) {
      folder = 'PRIMARY';
    }

    // Permission check: Non-premium men can only message if folder would be PRIMARY
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });

    if (sender.gender === 'M' && receiver?.gender === 'F' && folder === 'OTHERS') {
      // Only premium men can cold-message women
      if (!(sender as any).isPremium) {
        return NextResponse.json({
          error: 'Za pošiljanje sporočil brez povabila potrebujete Premium naročnino',
          requiresPremium: true
        }, { status: 403 });
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        folder,
      } as any,
    });

    // Trigger Pusher for real-time
    try {
      const { pusherServer } = await import('@/lib/pusher');
      await pusherServer.trigger(`chat-${receiverId}`, 'message:new', { ...message, folder });
      await pusherServer.trigger(`chat-${senderId}`, 'message:new', { ...message, folder });
    } catch (pusherError) {
      console.error("Pusher Error:", pusherError);
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Message Send Error:", error);
    return NextResponse.json({ error: 'Napaka pri pošiljanju' }, { status: 500 });
  }
}
