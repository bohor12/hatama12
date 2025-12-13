import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, gender } = body;

    if (!email || !password || !gender) {
      return NextResponse.json({ error: 'Manjkajoči podatki' }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Neveljaven email naslov' }, { status: 400 });
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json({ error: 'Geslo mora biti dolgo vsaj 8 znakov' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Uporabnik že obstaja' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        gender,
        // Create an empty filter for everyone by default
        filter: {
          create: {}
        }
      },
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json({ message: 'Uspešna registracija', user: { id: user.id, email: user.email } });
    response.cookies.set('token', token, { httpOnly: true, path: '/' });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Napaka na strežniku' }, { status: 500 });
  }
}
