import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // TODO: Re-enable auth when features are complete
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

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
        ]
      }
    });

    if (!relationship) {
      return NextResponse.json({ error: 'No mentorship relationship exists between users' }, { status: 403 });
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participantIds: { has: currentUserId } },
          { participantIds: { has: userId } }
        ]
      }
    });

    if (existingConversation) {
      return NextResponse.json({ conversationId: existingConversation.id });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participantIds: [currentUserId, userId]
      }
    });

    return NextResponse.json({ conversationId: conversation.id });
  } catch (error) {
    console.error('Error starting conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
