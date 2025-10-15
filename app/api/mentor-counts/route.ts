import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MentorCategory } from "@prisma/client";

export async function GET() {
  try {
    // Get counts for each category
    const counts = await prisma.mentor.groupBy({
      by: ["category"],
      _count: {
        userId: true,
      },
    });

    // Transform to a more usable format
    const categoryCountsMap: Record<string, number> = {};
    counts.forEach((count) => {
      categoryCountsMap[count.category] = count._count.userId;
    });

    // Return counts for all categories, defaulting to 0 if none exist
    const result = {
      TECHNOLOGY: categoryCountsMap[MentorCategory.TECHNOLOGY] || 0,
      BUSINESS: categoryCountsMap[MentorCategory.BUSINESS] || 0,
      DESIGN: categoryCountsMap[MentorCategory.DESIGN] || 0,
      MARKETING: categoryCountsMap[MentorCategory.MARKETING] || 0,
      CREATIVE: categoryCountsMap[MentorCategory.CREATIVE] || 0,
      HEALTH: categoryCountsMap[MentorCategory.HEALTH] || 0,
      MUSIC: categoryCountsMap[MentorCategory.MUSIC] || 0,
      OTHER: categoryCountsMap[MentorCategory.OTHER] || 0,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching mentor counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentor counts" },
      { status: 500 }
    );
  }
}
