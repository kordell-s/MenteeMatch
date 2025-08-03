import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    // Get all conversations where the user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { mentorId: userId },
          { menteeId: userId }
        ]
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
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Transform conversations to include mentorship data
    const transformedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        // Get the other participant ID
        const otherParticipantId = conversation.mentorId === userId ? conversation.menteeId : conversation.mentorId;
        
        if (!otherParticipantId) {
          return null;
        }

        // Check if there's a mentorship relationship
        const mentorship = await prisma.mentorship.findFirst({
          where: {
            OR: [
              { mentorId: userId, menteeId: otherParticipantId },
              { mentorId: otherParticipantId, menteeId: userId }
            ]
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
            }
          }
        });

        if (!mentorship) {
          return null;
        }

        return {
          ...conversation,
          mentorship
        };
      })
    );

    // Filter out null values
    const validConversations = transformedConversations.filter(conv => conv !== null);

    return NextResponse.json(validConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
