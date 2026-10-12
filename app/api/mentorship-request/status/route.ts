import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

/** Where the signed-in user stands with one mentor: none, pending request, or active mentorship. */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ state: "signed-out" });
  const mentorId = new URL(request.url).searchParams.get("mentorId");
  if (!mentorId) return NextResponse.json({ error: "mentorId is required" }, { status: 400 });

  const [mentorship, pending] = await Promise.all([
    prisma.mentorship.findFirst({ where: { mentorId, menteeId: user.id, status: "ACCEPTED" }, select: { id: true } }),
    prisma.mentorshipRequest.findFirst({ where: { mentorId, menteeId: user.id, status: "PENDING" }, select: { id: true, createdAt: true } }),
  ]);
  return NextResponse.json({
    state: mentorship ? "active" : pending ? "pending" : "none",
    requestedAt: pending?.createdAt ?? null,
  });
}
