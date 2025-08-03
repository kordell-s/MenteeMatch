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
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { mentorId: session.user.id },
          { menteeId: session.user.id }
        ]
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            title: true
          }
        },
        mentee: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            title: true
          }
        },
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Get participant details and unread counts for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        // Get the other participant
        const otherParticipantId = conv.mentorId === session.user.id ? conv.menteeId : conv.mentorId;
        const otherUser = conv.mentorId === session.user.id ? conv.mentee : conv.mentor;

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
            role: currentUser.role === 'MENTOR' ? 'mentee' : 'mentor',
            title: otherUser?.title || ''
          },
          lastMessage: conv.messages[0] || null,
          unreadCount,
          lastMessageTime: conv.lastMessageAt || conv.updatedAt
        };
      })
    );

    return NextResponse.json(conversationsWithDetails);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
