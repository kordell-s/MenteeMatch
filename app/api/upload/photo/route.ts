
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get('photo') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "Invalid file type. Please upload an image." }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine upload directory based on role
    const userRole = session.user.role;
    const uploadDir = userRole === "MENTOR" ? "mentor" : "mentee";
    
    // Create unique filename with user ID to avoid conflicts
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${session.user.id}-${timestamp}.${extension}`;
    
    // Use existing images directory structure
    const uploadsDir = join(process.cwd(), "public", "images", uploadDir);
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    const url = `/images/${uploadDir}/${filename}`;
    
    console.log(`✅ ${userRole} photo uploaded successfully:`, url);
    
    return NextResponse.json({ 
      success: true, 
      url: url 
    });
  } catch (error) {
    console.error("❌ Photo upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}