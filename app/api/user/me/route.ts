import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { filter: true },
    });

    if (!user) return NextResponse.json({ error: 'Uporabnik ne obstaja' }, { status: 404 });
    
    // Remove password
    const { password, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error) {
    return NextResponse.json({ error: 'Napaka na strežniku' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
    try {
      const token = req.cookies.get('token')?.value;
      if (!token) return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
  
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const userId = decoded.userId;
      
      const body = await req.json();
      const {
        name, height, birthDate, isSmoker, voiceCallAllowed, filter, photos,
        relationshipTypes, interests, description, partnerTraits
      } = body;
      
      // Update User Profile
      await prisma.user.update({
          where: { id: userId },
          data: {
              name,
              height: height ? parseInt(height) : null,
              birthDate: birthDate ? new Date(birthDate) : null,
              isSmoker,
              voiceCallAllowed,
              // Only update photos if provided
              ...(photos !== undefined && { photos: JSON.stringify(photos) }),
              // New Fields
              relationshipTypes: relationshipTypes ? JSON.stringify(relationshipTypes) : undefined,
              interests: interests ? JSON.stringify(interests) : undefined,
              // Use bio for description
              bio: description,
              partnerTraits: partnerTraits ? JSON.stringify(partnerTraits) : undefined,
          }
      });

      // Update Filters if provided
      if (filter) {
          await prisma.filter.upsert({
              where: { userId },
              create: {
                  userId,
                  minHeight: filter.minHeight ? parseInt(filter.minHeight) : null,
                  minAge: filter.minAge ? parseInt(filter.minAge) : null,
                  maxAge: filter.maxAge ? parseInt(filter.maxAge) : null,
                  mustNotSmoke: filter.mustNotSmoke
              },
              update: {
                minHeight: filter.minHeight ? parseInt(filter.minHeight) : null,
                minAge: filter.minAge ? parseInt(filter.minAge) : null,
                maxAge: filter.maxAge ? parseInt(filter.maxAge) : null,
                mustNotSmoke: filter.mustNotSmoke
              }
          })
      }

      return NextResponse.json({ message: "Profil posodobljen" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Napaka na strežniku' }, { status: 500 });
    }
}
