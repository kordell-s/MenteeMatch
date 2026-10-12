import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get mentee data
    const menteeProfile = await prisma.mentee.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!menteeProfile) {
      return NextResponse.json(
        { error: "Mentee profile not found" },
        { status: 404 }
      );
    }

    // Get mentor info if mentee has a confirmed mentorship
    const mentorship = await prisma.mentorship.findFirst({
      where: {
        menteeId: user.id,
        status: "ACCEPTED",
      },
      include: {
        mentor: true,
      },
    });

    let mentorInfo = null;
    if (mentorship) {
      mentorInfo = {
        id: mentorship.mentor.id,
        name: mentorship.mentor.name,
        title: mentorship.mentor.title,
        company: mentorship.mentor.company,
        bio: mentorship.mentor.bio,
        profilePicture: mentorship.mentor.profilePicture,
        rating: mentorship.mentor.rating ?? null,
        skills: mentorship.mentor.skills,
      };
    }

    // Open tasks assigned to this mentee, soonest first
    const openTasks = await prisma.task.findMany({
      where: { menteeId: user.id, status: { not: "COMPLETED" } },
      include: { milestone: { select: { id: true, title: true, roadmapId: true } } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
      take: 8,
    });

    // Get upcoming sessions
    const upcomingSessions = await prisma.session.findMany({
      where: {
        menteeId: user.id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        date: {
          gte: new Date(),
        },
      },
      include: {
        mentor: true,
      },
      orderBy: {
        date: "asc",
      },
      take: 5,
    });

    // Get completed sessions
    const completedSessions = await prisma.session.findMany({
      where: {
        menteeId: user.id,
        status: "COMPLETED",
      },
      include: {
        mentor: true,
      },
      orderBy: {
        date: "desc",
      },
      take: 10,
    });

    const dashboardData = {
      mentorInfo,
      tasks: openTasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        dueDate: t.dueDate?.toISOString() ?? null,
        milestone: t.milestone,
      })),
      upcomingSessions: upcomingSessions.map((session) => ({
        id: session.id,
        title: session.title,
        date: session.date.toISOString(),
        time: session.time,
        duration: session.duration,
        status: session.status,
        mentor: {
          id: session.mentor.id,
          name: session.mentor.name,
          profilePicture: session.mentor.profilePicture,
        },
      })),
      completedSessions: completedSessions.map((session) => ({
        id: session.id,
        title: session.title,
        date: session.date.toISOString(),
        mentor: {
          id: session.mentor.id,
          name: session.mentor.name,
        },
      })),
      progress: null, // Implement progress tracking later
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching mentee dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
