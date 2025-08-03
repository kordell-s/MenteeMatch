import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Other user ID is required" },
        { status: 400 }
      );
    }

    // Check if there's an accepted mentorship between these users
    const mentorship = await prisma.mentorship.findFirst({
      where: {
        OR: [
          { mentorId: currentUser.id, menteeId: userId },
          { mentorId: userId, menteeId: currentUser.id }
        ],
        status: "ACCEPTED"
      }
    });

    if (!mentorship) {
      return NextResponse.json(
        { error: "No accepted mentorship found between these users" },
        { status: 403 }
      );
    }

    // Determine mentor and mentee IDs
    const mentorId = mentorship.mentorId;
    const menteeId = mentorship.menteeId;

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { mentorId: currentUser.id, menteeId: userId },
          { mentorId: userId, menteeId: currentUser.id }
        ]
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            email: true
          }
        },
        mentee: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            email: true
          }
        }
      }
    });

    if (existingConversation) {
      return NextResponse.json({
        conversation: existingConversation,
        otherUser: existingConversation.mentorId === currentUser.id 
          ? existingConversation.mentee 
          : existingConversation.mentor
      });
    }

    // Create conversation if it doesn't exist
    const newConversation = await prisma.conversation.create({
      data: {
        mentorId,
        menteeId
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            email: true
          }
        },
        mentee: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      conversation: newConversation,
      otherUser: newConversation.mentorId === currentUser.id 
        ? newConversation.mentee 
        : newConversation.mentor
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    return NextResponse.json({ error: 'Failed to start conversation' }, { status: 500 });
  }
}
