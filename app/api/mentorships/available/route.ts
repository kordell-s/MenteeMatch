import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all accepted mentorships where current user is involved
    const mentorships = await prisma.mentorship.findMany({
      where: {
        OR: [
          { mentorId: currentUser.id },
          { menteeId: currentUser.id }
        ],
        status: "ACCEPTED"
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
        }
      }
    });

    // Get users they can chat with (exclude current user)
    const availableUsers = mentorships.map(mentorship => {
      return mentorship.mentorId === currentUser.id 
        ? mentorship.mentee 
        : mentorship.mentor;
    });

    return NextResponse.json(availableUsers);
  } catch (error) {
    console.error("Error fetching available users:", error);
    return NextResponse.json({ error: 'Failed to fetch available users' }, { status: 500 });
  }
}
