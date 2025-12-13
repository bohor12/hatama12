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
    const { receiverId } = body;

    if (!receiverId) return NextResponse.json({ error: 'Manjkajoči podatki' }, { status: 400 });

    // Check if interest already exists
    const existing = await prisma.interest.findUnique({
        where: {
            senderId_receiverId: { senderId, receiverId }
        }
    });

    if (existing) {
        return NextResponse.json({ error: 'Zanimanje že poslano' }, { status: 400 });
    }

    const interest = await prisma.interest.create({
        data: {
            senderId,
            receiverId,
            status: 'PENDING'
        }
    });

    return NextResponse.json({ message: "Zanimanje poslano!", interest });
  } catch (error) {
    return NextResponse.json({ error: 'Napaka na strežniku' }, { status: 500 });
  }
}

// Get interests sent TO me
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const userId = decoded.userId;

        const interests = await prisma.interest.findMany({
            where: { receiverId: userId, status: 'PENDING' },
            include: { sender: { select: { id: true, name: true, height: true, birthDate: true, photos: true } } }
        });

        return NextResponse.json(interests);
    } catch (error) {
        return NextResponse.json({ error: 'Napaka na strežniku' }, { status: 500 });
    }
}
