import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { mentorId: string } }
) {
  try {
    const { mentorId } = params;

    console.log("Fetching availability for mentor:", mentorId); // Debug log

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

    console.log("Found mentor:", mentor); // Debug log

    if (!mentor) {
      return NextResponse.json(
        { error: "Mentor not found" },
        { status: 404 }
      );
    }

    // Parse availability if it's stored as a string
    let availability: any = mentor.availability;
    
    console.log("Raw availability:", availability); // Debug log
    console.log("Availability type:", typeof availability); // Debug log
    
    if (typeof availability === "string") {
      console.log("Attempting to parse string availability:", availability); // Debug log
      try {
        // Only try to parse if it looks like JSON
        if (availability.trim().startsWith('[') || availability.trim().startsWith('{')) {
          availability = JSON.parse(availability);
        } else {
          // If it's a simple string, treat it as a single availability slot
          availability = [availability];
        }
      } catch (error) {
        console.error("Error parsing availability JSON:", error);
        console.error("Problematic availability string:", availability);
        // If parsing fails, treat the string as a simple availability description
        availability = [availability];
      }
    }

    // If availability is null or undefined, create empty array
    if (!availability) {
      availability = [];
    }

    // If availability is not an array, try to convert it
    if (!Array.isArray(availability)) {
      if (typeof availability === 'object') {
        // If it's an object, try to extract meaningful data
        availability = Object.values(availability).filter(Boolean);
      } else {
        // If it's something else, wrap it in an array
        availability = [availability];
      }
    }

    console.log("Processed availability before transformation:", availability); // Debug log

    // Transform availability data to include proper date objects and isAvailable flag
    const transformedAvailability = availability
      .filter((slot: any) => slot !== null && slot !== undefined && slot !== '')
      .map((slot: any) => {
        console.log("Processing slot:", slot, "Type:", typeof slot); // Debug log
        
        // Handle different possible formats
        if (typeof slot === "string") {
          // If it's just a string like "Monday 9:00 AM" or "Weekdays 9-5"
          return {
            date: slot,
            isAvailable: true,
          };
        } else if (slot && typeof slot === 'object') {
          // If it's an object with date/time information
          return {
            date: slot.date || slot.time || slot.day || slot.schedule || JSON.stringify(slot),
            isAvailable: slot.isAvailable !== false, // Default to true unless explicitly false
          };
        }
        
        // Fallback: convert to string
        return {
          date: String(slot),
          isAvailable: true,
        };
      });

    console.log("Transformed availability:", transformedAvailability); // Debug log

    return NextResponse.json(transformedAvailability);
  } catch (error) {
    console.error("Error fetching mentor availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
