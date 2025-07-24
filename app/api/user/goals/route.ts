import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // TODO: Replace this with actual session/authentication logic
    const currentUserId = "3459d90e-8bd8-43f2-9b17-b40b16625668"; // Alex James (mentee)
    
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a mentee
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        role: true,
        mentee: {
          select: {
            goals: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "MENTEE") {
      return NextResponse.json({ error: "Only mentees can have goals" }, { status: 400 });
    }

    const goals = user.mentee?.goals || [];

    return NextResponse.json({ goals });

  } catch (error) {
    console.error("Error fetching user goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // TODO: Replace this with actual session/authentication logic
    const currentUserId = "3459d90e-8bd8-43f2-9b17-b40b16625668"; // Alex James (mentee)
    
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { goals } = await request.json();

    if (!Array.isArray(goals)) {
      return NextResponse.json({ error: "Goals must be an array" }, { status: 400 });
    }

    // Validate goals against the enum
    const validGoals = [
      "GET_INTO_TECH",
      "TRANSITION_CAREER", 
      "BUILD_PROJECTS",
      "FIND_MENTOR",
      "INTERVIEW_PREP",
      "RESUME_REVIEW",
      "CAREER_GUIDANCE",
      "LEARN_CODING",
      "PUBLIC_SPEAKING",
      "NETWORKING"
    ];

    const invalidGoals = goals.filter(goal => !validGoals.includes(goal));
    if (invalidGoals.length > 0) {
      return NextResponse.json(
        { error: `Invalid goals: ${invalidGoals.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if user is a mentee
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        role: true,
        mentee: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "MENTEE") {
      return NextResponse.json({ error: "Only mentees can update goals" }, { status: 400 });
    }

    if (!user.mentee) {
      return NextResponse.json({ error: "Mentee profile not found" }, { status: 404 });
    }

    // Update the mentee's goals
    await prisma.mentee.update({
      where: { userId: currentUserId },
      data: { goals },
    });

    return NextResponse.json({ 
      message: "Goals updated successfully",
      goals 
    });

  } catch (error) {
    console.error("Error updating user goals:", error);
    return NextResponse.json(
      { error: "Failed to update goals" },
      { status: 500 }
    );
  }
}
