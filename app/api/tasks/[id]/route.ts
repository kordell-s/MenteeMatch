import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const body = await req.json();
      const { title, description, status, dueDate } = body;
  
      const updatedTask = await prisma.task.update({
        where: { id: params.id },
        data: {
          title,
          description,
          status,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        },
      });
  
      return NextResponse.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }
  }

  export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      await prisma.task.delete({ where: { id: params.id } });
      return NextResponse.json({ message: "Task deleted" });
    } catch (error) {
      console.error("Error deleting task:", error);
      return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
  }
  