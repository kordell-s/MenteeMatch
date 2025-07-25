import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { menteeId, mentorId, date, duration, title, description, offeringType, time } = body;

    // Validate required fields - add time to validation
    if (!menteeId || !mentorId || !date || !duration || !time) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Validate duration is a positive number
    if (duration <= 0) {
      return NextResponse.json(
        { error: "Duration must be a positive number" },
        { status: 400 }
      );
    }

    // Verify mentorship exists
    const mentorship = await prisma.mentorship.findFirst({
      where: {
        mentorId,
        menteeId,
      },
    });

    if (!mentorship) {
      return NextResponse.json(
        { error: "No mentorship relationship exists" },
        { status: 403 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        menteeId,
        mentorId,
        date: new Date(date),
        time,
        duration,
        title,
        description,
        status: "PENDING",
        offeringType,
      },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error creating session booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    let bookings;

    if (role === "MENTOR") {
      bookings = await prisma.booking.findMany({
        where: { mentorId: userId },
        include: {
          mentee: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { date: "asc" },
      });
    } else {
      bookings = await prisma.booking.findMany({
        where: { menteeId: userId },
        include: {
          mentor: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { date: "asc" },
      });
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
