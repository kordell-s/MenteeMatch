import { NextRequest, NextResponse } from "next/server";
import { getMentorRecommendations } from "@/lib/matching"; 
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { menteeId } = await req.json();
    
    if (!menteeId) {
      console.warn("Mentee ID is required for matching");
      return NextResponse.json([], { status: 200 });
    }

    // Fetch mentee with full profile for smart algorithm
    const mentee = await prisma.user.findUnique({
      where: { 
        id: menteeId,
      },
      select: {
        id: true,
        name: true,
        role: true,
        skills: true,
        bio: true,
        experienceLevel: true,
        profilePicture: true,
        mentee: {
          select: {
            goals: true,
          }
        }
      },
    });

    if (!mentee || mentee.role !== "MENTEE") {
      return NextResponse.json({ error: "Mentee not found" }, { status: 404 });
    }

    if (!mentee.skills || mentee.skills.length === 0) {
      console.warn("Mentee has no skills, returning empty match list");
      return NextResponse.json([], { status: 200 });
    }

    // Fetch mentors with full profile data for smart algorithm
    const mentors = await prisma.user.findMany({
      where: { 
        role: "MENTOR",
        mentor: {
          isNot: null
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        skills: true,
        bio: true,
        title: true,
        company: true,
        location: true,
        rating: true,
        languages: true,
        profilePicture: true,
        experienceLevel: true,
        availability: true,
        timeAvailability: true,
        mentor: {
          select: {
            pricing: true,
            category: true,
            specialization: true,
          }
        }
      },
    });

    if (!mentors || mentors.length === 0) {
      console.warn("No mentors found for matching");
      return NextResponse.json([], { status: 200 });
    }

    console.log('🧠 Using TF-IDF + Word Embeddings Algorithm');

    // Create mentee input text for smart algorithm
    // Weight skills and goals more heavily for better matching
    const skillsText = (mentee.skills || []).join(' ').repeat(3); // 3x weight
    const goalsText = (mentee.mentee?.goals?.map(g => g.toString()) || []).join(' ').repeat(2); // 2x weight
    const bioText = mentee.bio || '';
    const expText = mentee.experienceLevel || '';

    const menteeText = `${skillsText} ${goalsText} ${bioText} ${expText}`;


    const formattedMentors = mentors.map(mentor => ({
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      bio: mentor.bio || '',
      skills: mentor.skills || [],
      profilePicture: mentor.profilePicture,
      title: mentor.title,
      company: mentor.company,
      location: mentor.location,
      rating: mentor.rating,
      languages: mentor.languages || [],
      pricing: mentor.mentor?.pricing || 0,
      category: mentor.mentor?.category || 'TECHNOLOGY',
      specialization: mentor.mentor?.specialization || [], 
      experienceLevel: mentor.experienceLevel || 'ENTRY',
      availability: mentor.availability || [],
      timeAvailability: mentor.timeAvailability || []
    }));

    console.log('📝 Mentee Profile:', menteeText);
    console.log('👥 Analyzing', formattedMentors.length, 'mentors using TF-IDF + Word Embeddings...');

    // Use your smart matching algorithm
    const smartRecommendations = await getMentorRecommendations(menteeText, formattedMentors);
    
    // Convert to the format expected by your existing code
    const rankedMatches = smartRecommendations.map((mentor, index) => ({
      mentorId: mentor.id,
      score: mentor.score,
      rank: index + 1,
      algorithm: 'TF-IDF + Word Embeddings',
      mentorData: {
        name: mentor.name,
        title: mentor.title,
        company: mentor.company,
        rating: mentor.rating,
        pricing: mentor.pricing,
        category: mentor.category,
        specialization: mentor.specialization,
        profilePicture: mentor.profilePicture,
        skills: mentor.skills,
        bio: mentor.bio
      }
    }));

    console.log('🎯 Smart Algorithm Results:');
    rankedMatches.slice(0, 5).forEach((match, index) => {
      console.log(`#${index + 1} ${match.mentorData.name}: ${(match.score * 100).toFixed(1)}% match`);
    });

    // Log comprehensive results
    console.log('📋 Match Summary:', {
      menteeId: mentee.id,
      menteeName: mentee.name,
      algorithmUsed: 'TF-IDF + Word Embeddings',
      totalMatches: rankedMatches.length,
      topScore: rankedMatches[0]?.score || 0,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      matches: rankedMatches,
      algorithm: 'TF-IDF + Word Embeddings',
      totalMentors: mentors.length,
      success: true,
      menteeProfile: {
        name: mentee.name,
        skills: mentee.skills,
        goals: mentee.mentee?.goals || [],
        experienceLevel: mentee.experienceLevel
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in TF-IDF + Word Embeddings matching:", error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }

    return NextResponse.json({ 
      matches: [], 
      error: "Smart matching failed",
      algorithm: "TF-IDF + Word Embeddings",
      success: false
    }, { status: 200 });
  }
}