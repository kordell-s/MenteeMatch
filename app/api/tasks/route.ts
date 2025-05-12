import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, dueDate, mentorId, menteeId } = body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        mentor: { connect: { id: mentorId } },
        mentee: { connect: { id: menteeId } },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const menteeId = searchParams.get("menteeId");
  
      if (!menteeId) {
        return NextResponse.json({ error: "Mentee ID is required" }, { status: 400 });
      }
  
      const tasks = await prisma.task.findMany({
        where: { menteeId },
        orderBy: { dueDate: "asc" },
      });
  
      return NextResponse.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
  }
  