import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get mentor's basic info
    const mentorInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        title: true,
        profilePicture: true,
        bio: true,
        rating: true,
        availability: true,
        skills: true,
        company: true,
      },
    });

    if (!mentorInfo) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    // Upcoming sessions
    const upcomingSessions = await prisma.session.findMany({
      where: {
        mentorId: userId,
        status: "UPCOMING",
      },
      orderBy: { date: "asc" },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });

    // Completed sessions
    const completedSessions = await prisma.session.findMany({
      where: {
        mentorId: userId,
        status: "COMPLETED",
      },
    });

    // Mentorship requests (pending bookings)
    const mentorshipRequests = await prisma.booking.findMany({
      where: {
        mentorId: userId,
        status: "PENDING",
      },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });

    // Confirmed mentees (established mentorships)
    const confirmedMenteesRaw = await prisma.mentorship.findMany({
      where: {
        mentorId: userId,
      },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            title: true,
            profilePicture: true,
            bio: true,
            company:true,
            school:true,
            mentee: {
              select: {
                goals: true,
              },
            },
          },
        },
      },
    });

    const confirmedMentees = await Promise.all(
      confirmedMenteesRaw.map(async (entry) => {
        const sessions = await prisma.session.findMany({
          where: {
            menteeId: entry.mentee.id,
            mentorId: userId,
          },
          orderBy: { date: "desc" },
        });

        const completed = sessions.filter((s) => s.status === "COMPLETED");
        const upcoming = sessions.find((s) => s.status === "UPCOMING");

        return {
          id: entry.mentee.id,
          name: entry.mentee.name,
          profilePicture: entry.mentee.profilePicture,
          bio: entry.mentee.bio,
          company: entry.mentee.company,
            school: entry.mentee.school,
          goals: entry.mentee.mentee?.goals || [],
          status: sessions.length > 0 ? "active" : "inactive",
          sessionsCompleted: completed.length,
          joinedDate: sessions.at(-1)?.date || null,
          lastSession: completed.at(0)?.date || null,
          nextSession: upcoming?.date || null,
        };
      })
    );

    const totalMentees = confirmedMentees.length;

    return NextResponse.json({
      mentorInfo,
      upcomingSessions,
      completedSessionsCount: completedSessions.length,
      confirmedMentees,
      mentorshipRequests,
      totalMentees,
    });
  } catch (error) {
    console.error("Error fetching mentor dashboard:", error);
    return NextResponse.json({ error: "Failed to fetch mentor data" }, { status: 500 });
  }
}
