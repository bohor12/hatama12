import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "super-secret-key-change-this") as { userId: string };
    const userId = decoded.userId;

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${userId}-${Date.now()}.jpg`;
    const filepath = path.join(process.cwd(), "public/uploads/verification", filename);

    // Ensure directory exists
    await writeFile(filepath, buffer);

    // Update user status
    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: "PENDING",
      }
    });

    return NextResponse.json({ success: true, status: "PENDING" });
  } catch (error) {
    console.error("Verification upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
