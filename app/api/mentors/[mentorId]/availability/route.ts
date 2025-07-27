import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { mentorId: string } }
) {
  try {
    const { mentorId } = params;

    if (!mentorId) {
      return NextResponse.json(
        { error: "Mentor ID is required" },
        { status: 400 }
      );
    }

    // Fetch mentor with their availability
    const mentor = await prisma.user.findUnique({
      where: {
        id: mentorId,
        role: "MENTOR",
      },
      select: {
        id: true,
        availability: true,
      },
    });

    if (!mentor) {
      return NextResponse.json(
        { error: "Mentor not found" },
        { status: 404 }
      );
    }

    // Simplified availability parsing
    let availability: any[] = [];
    
    try {
      if (mentor.availability) {
        if (typeof mentor.availability === "string") {
          // Try to parse JSON, fallback to simple string handling
          try {
            availability = JSON.parse(mentor.availability);
          } catch {
            // If not JSON, treat as simple string
            availability = [{ date: mentor.availability, isAvailable: true }];
          }
        } else if (Array.isArray(mentor.availability)) {
          availability = mentor.availability;
        } else if (typeof mentor.availability === 'object') {
          availability = [mentor.availability];
        }
      }
    } catch (error) {
      console.error("Error processing availability:", error);
      availability = [];
    }

    // Transform and validate availability data
    const transformedAvailability = availability
      .filter((slot: any) => slot != null)
      .map((slot: any, index: number) => {
        try {
          if (typeof slot === "string") {
            return {
              id: index,
              date: slot,
              isAvailable: true,
            };
          } else if (slot && typeof slot === 'object') {
            return {
              id: index,
              date: slot.date || slot.time || slot.day || `Slot ${index + 1}`,
              isAvailable: slot.isAvailable !== false,
            };
          }
          return {
            id: index,
            date: String(slot),
            isAvailable: true,
          };
        } catch (error) {
          console.error("Error transforming slot:", error);
          return {
            id: index,
            date: `Slot ${index + 1}`,
            isAvailable: true,
          };
        }
      });

    return NextResponse.json(transformedAvailability);
  } catch (error) {
    console.error("Error fetching mentor availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
