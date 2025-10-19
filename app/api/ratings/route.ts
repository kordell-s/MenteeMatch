import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/ratings - Create a new rating
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, mentorId, ratingValue, feedback } = body;

    // Validate required fields
    if (!mentorId || !ratingValue) {
      return NextResponse.json(
        { error: "Missing required fields: mentorId and ratingValue" },
        { status: 400 }
      );
    }

    // Validate rating value (1-5)
    if (ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json(
        { error: "Rating value must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if user is a mentee
    if (session.user.role !== "MENTEE") {
      return NextResponse.json(
        { error: "Only mentees can rate mentors" },
        { status: 403 }
      );
    }

    // If sessionId provided, verify the session exists and belongs to this mentee
    if (sessionId) {
      const sessionExists = await prisma.session.findFirst({
        where: {
          id: sessionId,
          menteeId: session.user.id,
          mentorId: mentorId,
          status: "COMPLETED",
        },
      });

      if (!sessionExists) {
        return NextResponse.json(
          { error: "Session not found or not completed" },
          { status: 404 }
        );
      }

      // Check if this session has already been rated
      const existingRating = await prisma.rating.findFirst({
        where: {
          sessionId: sessionId,
          ratedById: session.user.id,
        },
      });

      if (existingRating) {
        return NextResponse.json(
          { error: "You have already rated this session" },
          { status: 400 }
        );
      }
    }

    // Create the rating
    const rating = await prisma.rating.create({
      data: {
        sessionId: sessionId || null,
        userId: mentorId,
        ratedById: session.user.id,
        ratingValue: parseFloat(ratingValue.toString()),
        feedback: feedback || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        ratedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update the session's rating field if sessionId was provided
    if (sessionId) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { rating: parseFloat(ratingValue.toString()) },
      });
    }

    // Calculate and update mentor's aggregate rating
    const allRatings = await prisma.rating.findMany({
      where: { userId: mentorId },
      select: { ratingValue: true },
    });

    const averageRating =
      allRatings.reduce((sum, r) => sum + r.ratingValue, 0) / allRatings.length;

    await prisma.user.update({
      where: { id: mentorId },
      data: { rating: averageRating },
    });

    return NextResponse.json(
      {
        success: true,
        rating,
        message: "Rating submitted successfully",
        averageRating,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating rating:", error);
    return NextResponse.json(
      { error: "Failed to create rating" },
      { status: 500 }
    );
  }
}

// GET /api/ratings - Get ratings for a user (mentor)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "userId or sessionId parameter is required" },
        { status: 400 }
      );
    }

    const where: any = {};
    if (userId) where.userId = userId;
    if (sessionId) where.sessionId = sessionId;

    const ratings = await prisma.rating.findMany({
      where,
      include: {
        ratedBy: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Calculate average rating
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.ratingValue, 0) / ratings.length
        : 0;

    return NextResponse.json({
      success: true,
      ratings,
      averageRating,
      totalRatings: ratings.length,
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}
