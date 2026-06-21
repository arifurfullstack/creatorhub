import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // 1. Session verification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in to upload files." },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file was uploaded." },
        { status: 400 }
      );
    }

    // 3. Validate file details
    const allowedMimePrefixes = ["image/", "video/", "audio/"];
    const isAllowed = allowedMimePrefixes.some(prefix => file.type.startsWith(prefix));

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Unsupported file type. Only image, video, and audio uploads are allowed." },
        { status: 400 }
      );
    }

    // Max limit check: 50MB for video/audio, 10MB for images
    const maxLimit = file.type.startsWith("image/") ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxLimit) {
      return NextResponse.json(
        { error: `File size too large. Maximum size allowed is ${maxLimit / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    // Determine type string matching Prisma Schema: 'image' | 'video' | 'audio'
    let mediaType = "image";
    if (file.type.startsWith("video/")) {
      mediaType = "video";
    } else if (file.type.startsWith("audio/")) {
      mediaType = "audio";
    }

    // 4. Ensure public uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // 5. Generate safe unique filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // 6. Write file stream buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      type: mediaType,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: "Server error occurred while saving the uploaded file." },
      { status: 500 }
    );
  }
}
