import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to respond to requests." }, { status: 401 });
    }
    const { id } = params;
    const { action } = await request.json(); // 'accept' or 'reject'

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

    // Only the mentor the request was sent to may respond
    if (mentorshipRequest.mentorId !== user.id) {
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

        // Create the mentorship as accepted (the model defaults to PENDING)
        const mentorship = await tx.mentorship.create({
          data: {
            mentorId: mentorshipRequest.mentorId,
            menteeId: mentorshipRequest.menteeId,
            status: "ACCEPTED",
          },
        });

        // Open their private conversation straight away
        await tx.conversation.upsert({
          where: {
            mentorId_menteeId: {
              mentorId: mentorshipRequest.mentorId,
              menteeId: mentorshipRequest.menteeId,
            },
          },
          update: {},
          create: {
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
