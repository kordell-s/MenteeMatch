import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all accepted mentorships AND accepted requests where current user is involved
    const [mentorships, mentorshipRequests] = await Promise.all([
      prisma.mentorship.findMany({
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
      }),
      prisma.mentorshipRequest.findMany({
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
      })
    ]);

    // Get users they can chat with from both sources
    const usersMap = new Map();

    // Add from Mentorship table
    mentorships.forEach(mentorship => {
      const otherUser = mentorship.mentorId === currentUser.id
        ? mentorship.mentee
        : mentorship.mentor;
      usersMap.set(otherUser.id, {
        id: otherUser.id,
        name: otherUser.name,
        image: otherUser.profilePicture,
        email: otherUser.email
      });
    });

    // Add from MentorshipRequest table (if not already added)
    mentorshipRequests.forEach(request => {
      const otherUser = request.mentorId === currentUser.id
        ? request.mentee
        : request.mentor;
      if (!usersMap.has(otherUser.id)) {
        usersMap.set(otherUser.id, {
          id: otherUser.id,
          name: otherUser.name,
          image: otherUser.profilePicture,
          email: otherUser.email
        });
      }
    });

    const availableUsers = Array.from(usersMap.values());

    return NextResponse.json(availableUsers);
  } catch (error) {
    console.error("Error fetching available users:", error);
    return NextResponse.json({ error: 'Failed to fetch available users' }, { status: 500 });
  }
}
