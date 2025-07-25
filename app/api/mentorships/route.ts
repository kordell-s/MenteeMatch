import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 }
      );
    }

    let mentorships;

    if (role === "MENTOR") {
      mentorships = await prisma.mentorship.findMany({
        where: { mentorId: userId },
        include: {
          mentee: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
              bio: true,
              company: true,
              school: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "MENTEE") {
      mentorships = await prisma.mentorship.findMany({
        where: { menteeId: userId },
        include: {
          mentor: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
              bio: true,
              company: true,
              title: true,
              rating: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    return NextResponse.json(mentorships);
  } catch (error) {
    console.error("Error fetching mentorships:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
