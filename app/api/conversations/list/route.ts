import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { mentorId: currentUser.id },
          { menteeId: currentUser.id }
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
        },
        messages: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1,
          select: {
            content: true,
            timestamp: true,
            senderId: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format conversations with other user info and last message
    const formattedConversations = conversations.map(conv => {
      const otherUser = conv.mentorId === currentUser.id ? conv.mentee : conv.mentor;
      const lastMessage = conv.messages[0] || null;
      
      return {
        id: conv.id,
        otherUser,
        lastMessage,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt
      };
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
