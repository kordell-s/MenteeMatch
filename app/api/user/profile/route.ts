import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    // Return current user's profile only
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        bio: true,
        skills: true,
        location: true,
        company: true,
        title: true,
        experienceLevel: true,
        role: true,
        mentor: true,
        mentee: true,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 401 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    
    // Update only the current user's profile
    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...body,
        // Prevent updating sensitive fields
        id: undefined,
        email: undefined,
        password: undefined,
        role: undefined,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
