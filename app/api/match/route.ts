import { NextRequest, NextResponse } from "next/server";
import { matchBySkillsIoU } from "@/lib/iouMatching";
import { prisma } from "@/lib/prisma";

export async function POST (req: NextRequest){
  try{
    const { menteeId } = await req.json();
    if (!menteeId) {
      console.warn("Mentee ID is required for matching");
      return NextResponse.json([], { status: 200 });
    }

    //Fetch mentee skills
    const mentee = await prisma.user.findUnique({
      where: { 
        id: menteeId,
        role: "MENTEE",
    },
      select: {
        id: true,
        skills: true,
      },
    });

    if (!mentee) {
      return NextResponse.json({ error: "Mentee not found" }, { status: 404 });
    }

    if (!mentee.skills || mentee.skills.length === 0) {
      console.warn("Mentee has no skills, returning empty match list");
      return NextResponse.json([], {status:200});
    }

    //Fetch mentors and skills
    const mentors = await prisma.user.findMany({
      where: { role: "MENTOR" },
      select: {
        id: true,
        skills: true,
      },
    });
    if (!mentors || mentors.length === 0) {
      console.warn("No mentors found for matching");
      return NextResponse.json([], { status: 200 });

    }

    //match mentee with mentors using IoU - call function
    const rankedMatches = matchBySkillsIoU(mentee, mentors);
    return NextResponse.json(rankedMatches, { status: 200 });
  } catch (error) {
    console.error("Error in matching API:", error);
return NextResponse.json([], {status:200});
  }
}