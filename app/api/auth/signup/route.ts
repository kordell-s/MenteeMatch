import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, bio, title, school } = await request.json();

    console.log("🔧 Signup attempt:", { 
      name, 
      email, 
      role, 
      passwordLength: password?.length,
      bio: bio?.substring(0, 50),
      title,
      school 
    });

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["MENTEE", "MENTOR"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("❌ User already exists:", email);
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    console.log("✅ No existing user found, attempting to create...");

    // Hash password for secure storage
    const saltRounds = process.env.NODE_ENV === 'production' ? 10 : 4;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log("🔒 Password hashed securely");

    // Create user with basic information
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        bio: bio?.trim() || "",
        title: title?.trim() || null,
        school: school?.trim() || null,
        profileComplete: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileComplete: true,
      },
    });

    console.log("✅ User created successfully:", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    // Verify the user was actually saved
    const savedUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true }
    });

    console.log("🔍 User verification check:", savedUser);

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileComplete: user.profileComplete,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Signup error details:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorName = error instanceof Error ? error.name : 'Unknown';
    const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : 'Unknown';
    
    console.error("❌ Error name:", errorName);
    console.error("❌ Error message:", errorMessage);
    console.error("❌ Error code:", errorCode);
    
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}