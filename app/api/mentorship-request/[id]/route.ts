import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, mentorId } = body; // action: 'accept' or 'reject'

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    // Find the mentorship request
    const mentorshipRequest = await prisma.mentorshipRequest.findUnique({
      where: { id },
      include: {
        mentee: true,
        mentor: true,
      },
    });

    if (!mentorshipRequest) {
      return NextResponse.json(
        { error: "Mentorship request not found" },
        { status: 404 }
      );
    }

    // Verify the mentor is the one responding
    if (mentorshipRequest.mentorId !== mentorId) {
      return NextResponse.json(
        { error: "Unauthorized to respond to this request" },
        { status: 403 }
      );
    }

    // Check if request is still pending
    if (mentorshipRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request has already been responded to" },
        { status: 400 }
      );
    }

    if (action === "accept") {
      // Create mentorship and update request status in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update request status
        const updatedRequest = await tx.mentorshipRequest.update({
          where: { id },
          data: { status: "ACCEPTED" },
        });

        // Create mentorship
        const mentorship = await tx.mentorship.create({
          data: {
            mentorId: mentorshipRequest.mentorId,
            menteeId: mentorshipRequest.menteeId,
          },
        });

        return { updatedRequest, mentorship };
      });

      return NextResponse.json({
        success: true,
        message: "Mentorship request accepted and mentorship created",
        request: result.updatedRequest,
        mentorship: result.mentorship,
      });
    } else {
      // Reject the request
      const updatedRequest = await prisma.mentorshipRequest.update({
        where: { id },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({
        success: true,
        message: "Mentorship request rejected",
        request: updatedRequest,
      });
    }
  } catch (error) {
    console.error("Error responding to mentorship request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
