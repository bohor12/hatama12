import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Napačen email ali geslo' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json({ message: 'Uspešna prijava', user: { id: user.id, email: user.email } });
    response.cookies.set('token', token, { httpOnly: true, path: '/' });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Napaka na strežniku' }, { status: 500 });
  }
}
