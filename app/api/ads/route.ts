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
    const { title, content, location, category, eventDate } = body;

    // Check limit for Men
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.gender === 'M') {
        const activeAds = await prisma.ad.count({
            where: { userId, isActive: true }
        });
        // Let's relax the limit slightly or keep it strict? Keeping it strict for now.
        if (activeAds >= 3) { // Increased limit slightly to 3 for better engagement
            return NextResponse.json({ error: 'Imate preveč aktivnih oglasov.' }, { status: 403 });
        }
    }

    const ad = await prisma.ad.create({
        data: {
            userId,
            title,
            content,
            location,
            category: category || "GENERAL",
            eventDate: eventDate ? new Date(eventDate) : null
        }
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Napaka na strežniku' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    // Return all active ads
    const ads = await prisma.ad.findMany({
        where: { isActive: true },
        include: {
            user: {
                select: {
                    name: true,
                    gender: true,
                    isVerified: true,
                    verificationStatus: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(ads);
}
