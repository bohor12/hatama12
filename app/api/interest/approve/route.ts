import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId; // The Receiver (Woman) approving the interest

    const body = await req.json();
    const { interestId } = body;

    const interest = await prisma.interest.findUnique({ where: { id: interestId } });

    if (!interest || interest.receiverId !== userId) {
        return NextResponse.json({ error: 'Napaka: Zanimanje ne obstaja ali ni vaše.' }, { status: 403 });
    }

    await prisma.interest.update({
        where: { id: interestId },
        data: { status: 'APPROVED' }
    });

    return NextResponse.json({ message: "Odobreno! Zdaj si lahko pišeta." });
  } catch (error) {
    return NextResponse.json({ error: 'Napaka na strežniku' }, { status: 500 });
  }
}
