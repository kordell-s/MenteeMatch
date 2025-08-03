import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all ACCEPTED mentorships where current user is involved
    const mentorships = await prisma.mentorship.findMany({
      where: {
        status: 'ACCEPTED',
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

    // Extract the other users (not the current user)
    const availableUsers = mentorships.map(mentorship => {
      if (mentorship.mentorId === currentUser.id) {
        return {
          ...mentorship.mentee,
          role: 'mentee' as const
        };
      } else {
        return {
          ...mentorship.mentor,
          role: 'mentor' as const
        };
      }
    });

    return NextResponse.json(availableUsers);
  } catch (error) {
    console.error('Error fetching available users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
