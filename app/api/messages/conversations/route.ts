import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user to check role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!currentUser || !['MENTOR', 'MENTEE'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Only mentors and mentees can access messages' }, { status: 403 });
    }

    // Find conversations where user is a participant
    const conversations = await prisma.Conversation.findMany({
      where: {
        participantIds: {
          has: session.user.id
        }
      },
      orderBy: {
        lastMessageTime: 'desc'
      }
    });

    // Get participant details and unread counts for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipantId = conv.participantIds.find(p => p !== session.user.id);
        const otherUser = await prisma.user.findUnique({
          where: { id: otherParticipantId },
          select: { id: true, name: true, email: true, role: true, profilePicture: true, title: true }
        });

        // Count unread messages for current user
        const unreadCount = await prisma.message.count({
          where: {
            receiverId: session.user.id,
            senderId: otherParticipantId,
            status: { not: 'read' }
          }
        });

        return {
          id: conv.id,
          person: {
            id: otherUser?.id || '',
            name: otherUser?.name || 'Unknown User',
            avatar: otherUser?.profilePicture || '/placeholder.svg',
            role: otherUser?.role?.toLowerCase() || 'user',
            title: otherUser?.title || `${otherUser?.role?.charAt(0).toUpperCase()}${otherUser?.role?.slice(1).toLowerCase()}` || 'User',
          },
          lastMessage: {
            text: conv.lastMessage || '',
            time: conv.lastMessageTime ? formatTime(conv.lastMessageTime) : '',
            isRead: unreadCount === 0,
          },
          unread: unreadCount,
          online: false,
        };
      })
    );

    return NextResponse.json(conversationsWithDetails);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'long' });
  } else {
    return date.toLocaleDateString();
  }
}
