import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { mentorId } = await req.json();

    // Verify mentorship exists and is confirmed
    const mentorship = await prisma.mentorship.findFirst({
      where: {
        menteeId: user.id,
        mentor: {
          id: mentorId,
        },
        status: "ACCEPTED",
      },
    });

    if (!mentorship) {
      return NextResponse.json(
        { error: "No confirmed mentorship found" },
        { status: 403 }
      );
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { menteeId: user.id, mentorId: mentorId },
          { menteeId: mentorId, mentorId: user.id },
        ],
      },
    });

    // Create conversation if it doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          menteeId: user.id,
          mentorId: mentorId,
        },
      });
    }

    return NextResponse.json({ conversationId: conversation.id });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
