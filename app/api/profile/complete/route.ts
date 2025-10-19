import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Specialization } from "@prisma/client";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("❌ No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("📋 Profile completion data received:", {
      bio: data.bio?.length,
      skills: data.skills?.length,
      availability: data.availability?.length,
      timeAvailability: data.timeAvailability?.length,
      specialization: data.specialization?.length,
      goals: data.goals?.length,
    });

    // Validate required fields
    if (!data.bio || !data.skills || data.skills.length === 0) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "Bio and at least one skill are required" },
        { status: 400 }
      );
    }

    console.log("🔄 Updating user profile...");
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        bio: data.bio,
        skills: data.skills || [],
        experienceLevel: data.experienceLevel || "ENTRY",
        company: data.company || null,
        title: data.title || null,
        school: data.school || null,
        location: data.location || null,
        languages: data.languages || [],
        availability: data.availability || [],
        timeAvailability: data.timeAvailability || [],
        profilePicture: data.profilePicture || null,
        profileComplete: true,
      },
    });

    console.log("✅ Updated user in profile completion:", {
      id: updatedUser.id,
      skills: updatedUser.skills?.length,
      availability: updatedUser.availability?.length,
      timeAvailability: updatedUser.timeAvailability?.length,
    });

    // Handle role-specific data
    if (session.user.role === "MENTOR") {
      if (!data.specialization || data.specialization.length === 0) {
        console.log("❌ Missing mentor specializations");
        return NextResponse.json(
          { error: "At least one specialization is required for mentors" },
          { status: 400 }
        );
      }

      console.log("🔄 Updating mentor profile...");
      console.log("📋 Specializations to save:", data.specialization);
      
      // Validate that all specializations are valid enum values
      const validSpecializations = data.specialization.filter((spec: string) => 
        Object.values(Specialization).includes(spec as Specialization)
      );
      
      if (validSpecializations.length !== data.specialization.length) {
        console.log("❌ Invalid specialization values found");
        console.log("Valid:", validSpecializations);
        console.log("Provided:", data.specialization);
        return NextResponse.json(
          { error: "Invalid specialization values provided" },
          { status: 400 }
        );
      }

      await prisma.mentor.upsert({
        where: { userId: session.user.id },
        update: {
          specialization: validSpecializations as Specialization[],
          category: data.category || "OTHER",
        },
        create: {
          userId: session.user.id,
          specialization: validSpecializations as Specialization[],
          category: data.category || "OTHER",
        },
      });
      
      console.log("✅ Updated mentor profile with specializations:", validSpecializations.length);
    } else if (session.user.role === "MENTEE") {
      if (!data.goals || data.goals.length === 0) {
        console.log("❌ Missing mentee goals");
        return NextResponse.json(
          { error: "At least one goal is required for mentees" },
          { status: 400 }
        );
      }

      console.log("🔄 Updating mentee profile...");

      await prisma.mentee.upsert({
        where: { userId: session.user.id },
        update: {
          goals: data.goals,
          detailedGoals: data.detailedGoals || null,
        },
        create: {
          userId: session.user.id,
          goals: data.goals,
          detailedGoals: data.detailedGoals || null,
        },
      });

      console.log("✅ Updated mentee profile with goals:", data.goals?.length, "and detailed goals:", data.detailedGoals?.length || 0, "chars");
    }

    console.log("✅ Profile completion successful");
    
    return NextResponse.json({ 
      success: true,
      message: "Profile completed successfully",
      profileComplete: true 
    });
  } catch (error) {
    console.error("❌ Error completing profile:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}