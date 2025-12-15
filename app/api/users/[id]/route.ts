import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/permissions';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
        // Optional: Block unauthorized access to user details
        // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const targetUser = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            photos: true,
            location: true,
            birthDate: true,
            // exclude sensitive fields
        }
    });

    if (!targetUser) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(targetUser);

  } catch (error) {
    console.error("Fetch user error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
