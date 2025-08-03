import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, currentUserId } = await request.json();
    if (!userId || !currentUserId) {
      return NextResponse.json({ error: 'User ID and current user ID required' }, { status: 400 });
    }

    // Verify users exist
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId }
    });

    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!currentUser || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure users have a mentor-mentee relationship
    const relationship = await prisma.mentorship.findFirst({
      where: {
        OR: [
          { mentorId: currentUserId, menteeId: userId },
          { mentorId: userId, menteeId: currentUserId }
        ],
        status: 'ACCEPTED'
      }
    });

    if (!relationship) {
      return NextResponse.json({ error: 'No active mentorship relationship found' }, { status: 403 });
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { mentorId: currentUserId, menteeId: userId },
          { mentorId: userId, menteeId: currentUserId }
        ]
      },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Determine who is mentor and who is mentee
    const isCurrentUserMentor = currentUser.role === 'MENTOR';
    const mentorId = isCurrentUserMentor ? currentUserId : userId;
    const menteeId = isCurrentUserMentor ? userId : currentUserId;

    // Create new conversation
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
            profilePicture: true
          }
        },
        mentee: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        },
        messages: true
      }
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    console.error("Error starting conversation:", error);
    return NextResponse.json({ error: 'Failed to start conversation' }, { status: 500 });
  }
}

