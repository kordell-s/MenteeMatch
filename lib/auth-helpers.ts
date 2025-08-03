import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser(req?: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  // Get user from database using email from session
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      mentor: true,
      mentee: true,
    },
  });

  return user;
}

export async function requireAuth(req?: NextRequest) {
  const user = await getCurrentUser(req);
  
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  return user;
}

export async function requireMentor(req?: NextRequest) {
  const user = await requireAuth(req);
  
  if (user.role !== "MENTOR") {
    throw new Error("Mentor access required");
  }
  
  return user;
}

export async function requireMentee(req?: NextRequest) {
  const user = await requireAuth(req);
  
  if (user.role !== "MENTEE") {
    throw new Error("Mentee access required");
  }
  
  return user;
}
