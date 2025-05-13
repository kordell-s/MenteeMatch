import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get confirmed mentorship
    const mentorship = await prisma.mentorship.findFirst({
      where: { menteeId: userId },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            title: true,
            profilePicture: true,
            company: true,
            bio: true,
            skills: true,
            rating: true,
          },
        },
      },
    });

    // If no mentor assigned
    if (!mentorship) {
      return NextResponse.json({
        mentorInfo: null,
        tasks: [],
        upcomingSessions: [],
        completedSessions: [],
        progress: 0,
      });
    }

    // Fetch tasks
    const tasks = await prisma.task.findMany({
      where: { menteeId: userId },
      orderBy: { dueDate: "asc" },
    });

    // Fetch sessions
    const sessions = await prisma.session.findMany({
      where: { menteeId: userId },
      orderBy: { date: "desc" },
        include: {
            mentor: {
            select: {
                name: true,
                profilePicture: true,
            },
            },
        },
    });

    const upcomingSessions = sessions
    .filter((s) => s.status === "UPCOMING")
    .map((s) => ({
      ...s,
      title: `Session with ${s.mentor.name}`,
    }));
  
  const completedSessions = sessions
    .filter((s) => s.status === "COMPLETED")
    .map((s) => ({
      ...s,
      title: `Session with ${s.mentor.name}`,
    }));
  
    const lastSession = completedSessions.at(0)?.date || null;
    const nextSession = upcomingSessions.at(0)?.date || null;

    // Calculate progress from tasks
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return NextResponse.json({
      mentorInfo: mentorship.mentor,
      tasks,
      upcomingSessions,
      completedSessions,
      progress,
      lastSession,
        nextSession,
    });

  } catch (error) {
    console.error("Error fetching mentee dashboard:", error);
    return NextResponse.json({ error: "Failed to fetch mentee data" }, { status: 500 });
  }
}
