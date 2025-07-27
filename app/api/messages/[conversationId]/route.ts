import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;

    // Since Message doesn't have conversationId, we need to find messages through participants
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Get messages between the participants in this conversation
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: conversation.mentorId,
            receiverId: conversation.menteeId
          },
          {
            senderId: conversation.menteeId,
            receiverId: conversation.mentorId
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;
    const { content, senderId } = await request.json();

    if (!content || !senderId) {
      return NextResponse.json(
        { error: 'Content and sender ID are required' },
        { status: 400 }
      );
    }

    // Verify the conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Verify the sender is a participant in the conversation
    if (conversation.mentorId !== senderId && conversation.menteeId !== senderId) {
      return NextResponse.json(
        { error: 'Sender is not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Find the receiver ID (the other participant)
    const receiverId = senderId === conversation.mentorId ? conversation.menteeId : conversation.mentorId;

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    // Update conversation's updatedAt timestamp and lastMessage
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { 
        updatedAt: new Date(),
        lastMessageAt: new Date()
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
