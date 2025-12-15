import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${user.id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");

    // Ensure upload directory exists
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // Ignore error if it already exists
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const photoUrl = `/uploads/${filename}`;

    // Update user photos in database
    const currentPhotos = user.photos ? JSON.parse(user.photos) : [];
    const updatedPhotos = [...currentPhotos, photoUrl];

    await prisma.user.update({
        where: { id: user.id },
        data: { photos: JSON.stringify(updatedPhotos) }
    });

    return NextResponse.json({ url: photoUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
