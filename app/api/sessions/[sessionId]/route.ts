import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const body = await request.json();
    const { status, userId } = body;
    const { sessionId } = params;

    if (!sessionId || !status || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, status, userId" },
        { status: 400 }
      );
    }

    // Update the session status
    const updatedSession = await prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Session updated successfully",
      session: updatedSession,
    });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { 
        error: "Failed to update session",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
