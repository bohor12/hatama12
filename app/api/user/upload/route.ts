import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    // 1. Check Authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Form Data (Native Next.js/Web API)
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 3. Validate File
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Ensure Directory Exists
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });

    // 5. Generate Unique Filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, ''); // Sanitize
    const filename = `${uniqueSuffix}-${originalName}`;
    const filepath = path.join(uploadDir, filename);

    // 6. Save File to Disk
    await writeFile(filepath, buffer);
    const publicUrl = `/uploads/${filename}`;

    // 7. Update User Profile in Database
    // Fetch current user to get existing photos
    const currentUser = await prisma.user.findUnique({ where: { id: user.id } });

    let photos: string[] = [];
    if (currentUser?.photos) {
        try {
            photos = JSON.parse(currentUser.photos);
        } catch (e) {
            photos = [];
        }
    }

    // Add new photo
    photos.push(publicUrl);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            photos: JSON.stringify(photos)
        }
    });

    return NextResponse.json({ message: "File uploaded successfully", url: publicUrl });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
