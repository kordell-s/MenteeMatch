import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, content } = await request.json();

    if (!conversationId || !content?.trim()) {
      return NextResponse.json(
        { error: "Conversation ID and content are required" },
        { status: 400 }
      );
    }

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { mentorId: currentUser.id },
          { menteeId: currentUser.id }
        ]
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    // Determine the receiver ID (the other participant in the conversation)
    const receiverId = conversation.mentorId === currentUser.id 
      ? conversation.menteeId 
      : conversation.mentorId;

    // Create the message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: currentUser.id,
        receiverId: receiverId,
        conversationId: conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
