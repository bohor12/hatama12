import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canUserMessage } from '@/lib/permissions';
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

    // CHECK PERMISSIONS
    const permission = await canUserMessage(senderId, receiverId);
    if (!permission.allowed) {
      return NextResponse.json({ error: permission.reason || 'Sporočilo ni dovoljeno' }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Napaka pri pošiljanju' }, { status: 500 });
  }
}
