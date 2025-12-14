import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/permissions';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Simulate usage of prisma to ensure import works
    const count = await prisma.user.count();

    return NextResponse.json({ message: "Success", userEmail: user.email, count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
