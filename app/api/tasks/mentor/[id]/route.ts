import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mentorId = params.id;

    // Verify that the requesting user is the mentor or has appropriate permissions
    if (user.id !== mentorId && user.role !== "MENTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        mentorId: mentorId,
      },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // Pending tasks first
        { dueDate: "asc" }, // Then by due date
        { createdAt: "desc" }, // Then by creation date
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching mentor tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
