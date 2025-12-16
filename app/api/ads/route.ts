import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    const body = await req.json();
    const { title, content, location, contactType } = body;
    
    // Validate contactType
    const ALLOWED_TYPES = [
        "Seks za eno noč",
        "Prijateljstvo",
        "Reden seks",
        "Resna zveza",
        "Samo klepet",
        "Drugo"
    ];
    if (contactType && !ALLOWED_TYPES.includes(contactType)) {
        return NextResponse.json({ error: 'Neveljaven tip kontakta.' }, { status: 400 });
    }

    // Check limit for Men
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.gender === 'M') {
        const activeAds = await prisma.ad.count({
            where: { userId, isActive: true }
        });
        if (activeAds >= 1) {
            return NextResponse.json({ error: 'Moški lahko imajo samo 1 aktiven oglas.' }, { status: 403 });
        }
    }

    const ad = await prisma.ad.create({
        data: {
            userId,
            title,
            content,
            location,
            contactType
        }
    });

    return NextResponse.json(ad);
  } catch (error) {
    return NextResponse.json({ error: 'Napaka na strežniku' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    // Return all active ads
    const ads = await prisma.ad.findMany({
        where: { isActive: true },
        include: { user: { select: { name: true, gender: true } } },
        orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(ads);
}
