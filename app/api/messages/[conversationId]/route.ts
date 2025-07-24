import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is participant in this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.conversationId }
    });

    if (!conversation || !conversation.participantIds.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get messages for this conversation
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: { in: conversation.participantIds.filter(id => id !== session.user.id) }
          },
          {
            receiverId: session.user.id,
            senderId: { in: conversation.participantIds.filter(id => id !== session.user.id) }
          }
        ]
      },
      orderBy: { timestamp: 'asc' }
    });

    // Mark messages as read for current user
    await prisma.message.updateMany({
      where: {
        receiverId: session.user.id,
        senderId: { in: conversation.participantIds.filter(id => id !== session.user.id) },
        status: { not: 'read' }
      },
      data: { status: 'read' }
    });

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      sender: msg.senderId === session.user.id ? 'me' : 'them',
      text: msg.content,
      time: formatMessageTime(msg.timestamp),
      isRead: msg.status === 'read',
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }

    // Verify user is participant in this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.conversationId }
    });

    if (!conversation || !conversation.participantIds.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const receiverId = conversation.participantIds.find(p => p !== session.user.id);
    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 400 });
    }

    // Create new message
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content: content.trim(),
        status: 'sent'
      }
    });

    // Update conversation with last message
    await prisma.conversation.update({
      where: { id: params.conversationId },
      data: {
        lastMessage: content.trim(),
        lastMessageTime: new Date()
      }
    });

    return NextResponse.json({
      id: message.id,
      sender: 'me',
      text: message.content,
      time: 'Just now',
      isRead: false,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function formatMessageTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 60000) {
    return 'Just now';
  } else if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
}
