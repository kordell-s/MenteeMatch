import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, school, bio, skills, interests } = await request.json();

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        title: title?.trim() || null,
        school: school?.trim() || null,
        bio: bio?.trim() || null,
        skills: skills?.trim() || null,
        profileComplete: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        school: true,
        bio: true,
        skills: true,
        profileComplete: true,
      },
    });

    return NextResponse.json({
      message: "Profile completed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile completion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
