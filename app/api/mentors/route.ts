import { prisma } from "@/lib/prisma"; 
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const mentors = await prisma.user.findMany({
        where:{
            role: "MENTOR",
        },
      include: {
        mentor:true,
        mentorshipsAsMentor:{
          include:{
            mentee:true,
          },
        },
      },
    });

    return NextResponse.json(mentors);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return NextResponse.json({ error: "Failed to fetch mentors" }, { status: 500 });
  }
}