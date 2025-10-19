import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        mentor: true,
        mentee: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("📋 Fetched user profile:", {
      id: user.id,
      name: user.name,
      skills: user.skills,
      availability: user.availability,
      timeAvailability: user.timeAvailability,
      role: user.role
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      photo: user.profilePicture,
      title: user.title,
      school: user.school,
      company: user.company,
      bio: user.bio,
      location: user.location,
      skills: user.skills || [], // Ensure arrays are returned
      experienceLevel: user.experienceLevel,
      availability: user.availability || [],
      timeAvailability: user.timeAvailability || [],
      languages: user.languages || [],
      role: user.role,
      profileComplete: user.profileComplete,
      mentor: user.mentor ? {
        specialization: user.mentor.specialization || [],
        category: user.mentor.category,
      } : null,
      mentee: user.mentee ? {
        goals: user.mentee.goals || [],
        detailedGoals: user.mentee.detailedGoals,
        rating: user.mentee.rating,
      } : null,
    });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("📋 Profile update data received:", data);

    // Update user information
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        bio: data.bio,
        skills: data.skills || [],
        experienceLevel: data.experienceLevel,
        company: data.company || null,
        title: data.title || null,
        school: data.school || null,
        location: data.location || null,
        languages: data.languages || [],
        availability: data.availability || [],
        timeAvailability: data.timeAvailability || [],
        profilePicture: data.photo || null,
        profileComplete: true,
      },
      include: {
        mentor: true,
        mentee: true,
      },
    });

    console.log("✅ Updated user profile:", {
      id: updatedUser.id,
      skills: updatedUser.skills,
      availability: updatedUser.availability,
      timeAvailability: updatedUser.timeAvailability,
    });

    // Update role-specific data
    if (session.user.role === "MENTOR") {
      // Update or create mentor profile
      await prisma.mentor.upsert({
        where: { userId: session.user.id },
        update: {
          specialization: data.specialization || [],
          category: data.category || "OTHER",
        },
        create: {
          userId: session.user.id,
          specialization: data.specialization || [],
          category: data.category || "OTHER",
        },
      });
    } else if (session.user.role === "MENTEE") {
      // Update or create mentee profile
      await prisma.mentee.upsert({
        where: { userId: session.user.id },
        update: {
          goals: data.mentee?.goals || data.goals || [],
          detailedGoals: data.mentee?.detailedGoals || null,
        },
        create: {
          userId: session.user.id,
          goals: data.mentee?.goals || data.goals || [],
          detailedGoals: data.mentee?.detailedGoals || null,
        },
      });
    }

    // Fetch the updated profile with relations
    const finalUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        mentor: true,
        mentee: true,
      },
    });

    if (!finalUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: finalUser.id,
      name: finalUser.name,
      email: finalUser.email,
      photo: finalUser.profilePicture,
      title: finalUser.title,
      school: finalUser.school,
      company: finalUser.company,
      bio: finalUser.bio,
      location: finalUser.location,
      skills: finalUser.skills || [],
      experienceLevel: finalUser.experienceLevel,
      availability: finalUser.availability || [],
      timeAvailability: finalUser.timeAvailability || [],
      languages: finalUser.languages || [],
      role: finalUser.role,
      profileComplete: finalUser.profileComplete,
      mentor: finalUser.mentor ? {
        specialization: finalUser.mentor.specialization || [],
        category: finalUser.mentor.category,
      } : null,
      mentee: finalUser.mentee ? {
        goals: finalUser.mentee.goals || [],
        detailedGoals: finalUser.mentee.detailedGoals,
        rating: finalUser.mentee.rating,
      } : null,
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}