import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { sessionId } = params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "UPCOMING"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Find the session and verify user has permission to modify it
    const existingSession = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        mentee: true,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Check if user is either the mentor or mentee of this session
    if (existingSession.mentorId !== user.id && existingSession.menteeId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to modify this session" },
        { status: 403 }
      );
    }

    // Update the session status
    const updatedSession = await prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      id: updatedSession.id,
      status: updatedSession.status,
    });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
