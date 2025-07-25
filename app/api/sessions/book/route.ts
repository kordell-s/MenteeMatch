import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mentorId, menteeId, title, date, topic, notes, status } = body;

    // Validate required fields
    if (!mentorId || !menteeId || !title || !date) {
      return NextResponse.json(
        { error: "Missing required fields: mentorId, menteeId, title, date" },
        { status: 400 }
      );
    }

    // Extract time from the date
    const sessionDate = new Date(date);
    const time = sessionDate.toTimeString().slice(0, 5); // Extract HH:MM format

    // Create a booking that represents the session
    const booking = await prisma.booking.create({
      data: {
        mentorId,
        menteeId,
        status: status || "PENDING",
        date: sessionDate,
        time,
        duration: 60, // Default 60 minutes
        title,
        description: notes || topic, // Use description field for notes/topic
        offeringType: topic, // Use offeringType for topic
      },
    });

    return NextResponse.json({
      success: true,
      message: "Session booked successfully",
      session: {
        id: booking.id,
        title: booking.title,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        status: booking.status,
        topic: booking.offeringType,
        notes: booking.description,
      },
    });
  } catch (error) {
    console.error("Error booking session:", error);
    return NextResponse.json(
      { 
        error: "Failed to book session",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}