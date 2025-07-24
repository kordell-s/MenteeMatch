import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Verify current user role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!currentUser || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure only mentors and mentees can message each other
    if (!['MENTOR', 'MENTEE'].includes(currentUser.role) || 
        !['MENTOR', 'MENTEE'].includes(targetUser.role)) {
      return NextResponse.json({ error: 'Only mentors and mentees can message' }, { status: 403 });
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participantIds: { has: session.user.id } },
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
        participantIds: [session.user.id, userId]
      }
    });

    return NextResponse.json({ conversationId: conversation.id });
  } catch (error) {
    console.error('Error starting conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
