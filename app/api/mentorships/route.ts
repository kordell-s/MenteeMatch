import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

const person = {
  id: true,
  name: true,
  profilePicture: true,
  bio: true,
  company: true,
  title: true,
  school: true,
  rating: true,
};

/**
 * The signed-in user's mentorships, from their side of the relationship.
 * Optional filters: ?status=ACCEPTED, ?menteeId=..., ?id=...
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = new URL(request.url).searchParams;
    const status = params.get("status");
    const menteeId = params.get("menteeId");
    const id = params.get("id");

    const mentorships = await prisma.mentorship.findMany({
      where: {
        ...(user.role === "MENTOR" ? { mentorId: user.id } : { menteeId: user.id }),
        ...(status ? { status: status as "PENDING" | "ACCEPTED" | "REJECTED" } : {}),
        ...(menteeId && user.role === "MENTOR" ? { menteeId } : {}),
        ...(id ? { id } : {}),
      },
      include: { mentor: { select: person }, mentee: { select: person } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(mentorships);
  } catch (error) {
    console.error("Error fetching mentorships:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
