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

    // Get mentor data
    const mentorProfile = await prisma.mentor.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!mentorProfile) {
      return NextResponse.json(
        { error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    // Get confirmed mentees from both Mentorship table AND accepted MentorshipRequests
    const [confirmedMentorships, acceptedRequests] = await Promise.all([
      prisma.mentorship.findMany({
        where: {
          mentorId: user.id,
          status: "ACCEPTED",
        },
        include: {
          mentee: {
            include: {
              mentee: {
                select: {
                  goals: true,
                },
              },
            },
          },
        },
      }),
      prisma.mentorshipRequest.findMany({
        where: {
          mentorId: user.id,
          status: "ACCEPTED",
        },
        include: {
          mentee: {
            include: {
              mentee: {
                select: {
                  goals: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Combine mentees from both sources and remove duplicates
    const menteeMap = new Map();

    // Add mentees from Mentorship table
    confirmedMentorships.forEach((mentorship) => {
      menteeMap.set(mentorship.mentee.id, {
        id: mentorship.mentee.id,
        name: mentorship.mentee.name,
        profilePicture: mentorship.mentee.profilePicture,
        email: mentorship.mentee.email,
        title: mentorship.mentee.title,
        company: mentorship.mentee.company,
        bio: mentorship.mentee.bio,
        goals: mentorship.mentee.mentee?.goals || [],
        status: "active",
        joinedDate: mentorship.createdAt.toISOString().split('T')[0],
      });
    });

    // Add mentees from accepted MentorshipRequests (if not already in map)
    acceptedRequests.forEach((request) => {
      if (!menteeMap.has(request.mentee.id)) {
        menteeMap.set(request.mentee.id, {
          id: request.mentee.id,
          name: request.mentee.name,
          profilePicture: request.mentee.profilePicture,
          email: request.mentee.email,
          title: request.mentee.title,
          company: request.mentee.company,
          bio: request.mentee.bio,
          goals: request.mentee.mentee?.goals || [],
          status: "active",
          joinedDate: request.createdAt.toISOString().split('T')[0],
        });
      }
    });

    const confirmedMentees = Array.from(menteeMap.values());

    // Get recent mentorship requests
    const recentRequests = await prisma.mentorshipRequest.findMany({
      where: {
        mentorId: user.id,
      },
      include: {
        mentee: {
          include: {
            mentee: {
              select: {
                goals: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Get upcoming sessions
    const upcomingSessions = await prisma.session.findMany({
      where: {
        mentorId: user.id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        date: {
          gte: new Date(),
        },
      },
      include: {
        mentee: true,
      },
      orderBy: {
        date: "asc",
      },
      take: 5,
    });

    // Get completed sessions count
    const completedSessionsCount = await prisma.session.count({
      where: {
        mentorId: user.id,
        status: "COMPLETED",
      },
    });

    const dashboardData = {
      confirmedMentees: confirmedMentees,
      recentRequests: recentRequests.map((request) => ({
      id: request.id,
      status: request.status,
      message: request.message,
      createdAt: request.createdAt.toISOString(),
      mentee: {
        id: request.mentee.id,
        name: request.mentee.name,
        profilePicture: request.mentee.profilePicture,
        goals: request.mentee.mentee?.goals || [],
      },
      })),
      upcomingSessions: upcomingSessions.map((session) => ({
      id: session.id,
      title: session.title,
      date: session.date.toISOString(),
      time: session.time,
      duration: session.duration,
      status: session.status,
      mentee: {
        id: session.mentee.id,
        name: session.mentee.name,
        profilePicture: session.mentee.profilePicture,
      },
      })),
      completedSessions: completedSessionsCount,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching mentor dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
