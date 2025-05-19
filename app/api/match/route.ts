
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import {
  preprocess,
  buildVocabulary,
  vectorize,
  cosineSimilarity,
} from "@/lib/matching";

export async function POST(req: NextRequest) {
  const { menteeId } = await req.json();

  if (!menteeId) {
    return NextResponse.json({ error: "menteeId is required" }, { status: 400 });
  }

  // 1. Load mentee with user info
  const mentee = await prisma.mentee.findUnique({
    where: { userId: menteeId },
    include: {
      user: {
        select: {
          bio: true,
          languages: true,
          location: true,
        },
      },
    },
  });

  if (!mentee) {
    return NextResponse.json({ error: "Mentee not found" }, { status: 404 });
  }

  // 2. Load mentors with user info
  const mentors = await prisma.mentor.findMany({
    include: {
      user: {
        select: {
          id: true,
          bio: true,
          skills: true,
          languages: true,
          location: true,
          company: true,
        },
      },
    },
  });

  // 3. Combine mentee goals and bio into one string
  const menteeText = [
    ...mentee.goals,                    // enums
    mentee.user.bio || "",
    ...(mentee.user.languages || []),
    mentee.user.location || ""
  ].join(" ");

  const menteeTokens = preprocess(menteeText);

  // 4. Build mentor documents
  const mentorDocs = mentors.map((mentor) => {
    return [
      ...mentor.specialization,               
      mentor.user.bio || "",
      ...(mentor.user.skills || []),          
      ...(mentor.user.languages || []),
      mentor.user.company || "",
      mentor.user.location || ""
    ].join(" ");
  });

  const mentorTokensList = mentorDocs.map(preprocess);

  // 5. Vectorize using shared vocab
  const vocab = buildVocabulary([menteeTokens, ...mentorTokensList]);
  const menteeVector = vectorize(menteeTokens, vocab);
  const mentorVectors = mentorTokensList.map((tokens) => vectorize(tokens, vocab));

  // 6. Score and rank mentors
  const rankedMatches = mentors
    .map((mentor, index) => ({
      mentorId: mentor.user.id,
      similarityScore: cosineSimilarity(menteeVector, mentorVectors[index]),
    }))
    .sort((a, b) => b.similarityScore - a.similarityScore);

  return NextResponse.json(rankedMatches);
}
