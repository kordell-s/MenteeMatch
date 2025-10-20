import { NextRequest, NextResponse } from "next/server";
import { getMentorRecommendations } from "@/lib/matching";
import { prisma } from "@/lib/prisma";

// Map Prisma enum skills to embedding-friendly text for better semantic matching
function mapSkillToEmbeddingText(skill: string): string {
  const skillMapping: { [key: string]: string } = {
    // Core Tech Skills
    'REACT': 'react javascript frontend framework',
    'NODE_JS': 'nodejs backend javascript server',
    'TYPESCRIPT': 'typescript javascript types',
    'JAVASCRIPT': 'javascript programming web',
    'PYTHON': 'python programming coding',
    'JAVA': 'java programming enterprise',
    'CSHARP': 'csharp dotnet microsoft',
    'CPLUSPLUS': 'cpp programming systems',
    'RUBY': 'ruby rails programming',
    'GO': 'golang programming backend',
    'PHP': 'php web programming',
    'SQL': 'sql database queries',
    'NOSQL': 'nosql database mongodb',

    // Architecture & Systems
    'SYSTEM_DESIGN': 'system design architecture scalability',
    'MICROSERVICES': 'microservices architecture distributed',
    'DEVOPS': 'devops deployment automation',
    'AWS': 'aws cloud amazon infrastructure',
    'AZURE': 'azure microsoft cloud',
    'DOCKER': 'docker containers deployment',
    'KUBERNETES': 'kubernetes orchestration containers',

    // Data & ML
    'DATA_SCIENCE': 'data science analytics statistics',
    'MACHINE_LEARNING': 'machine learning ai models',
    'DEEP_LEARNING': 'deep learning neural networks',
    'COMPUTER_VISION': 'computer vision image recognition',
    'NLP': 'natural language processing text',
    'MLOPS': 'mlops machine learning operations',
    'BIG_DATA': 'big data hadoop spark',
    'STATISTICS': 'statistics math data analysis',

    // Design
    'UX': 'ux user experience design',
    'UI': 'ui user interface design',
    'FIGMA': 'figma design prototyping',
    'DESIGN_SYSTEMS': 'design systems components ui',
    'ACCESSIBILITY': 'accessibility usability inclusive',
    'PORTFOLIO_REVIEW': 'portfolio review feedback critique',
    'MOTION_DESIGN': 'motion design animation graphics',

    // Product & Management
    'PRODUCT_MANAGEMENT': 'product management strategy roadmap',
    'AGILE': 'agile scrum methodology',
    'SCRUM': 'scrum agile sprint',
    'USER_RESEARCH': 'user research testing interviews',
    'MARKET_ANALYSIS': 'market analysis research competition',

    // Business
    'BUSINESS_STRATEGY': 'business strategy planning growth',
    'STARTUPS': 'startup entrepreneurship business',
    'DIGITAL_MARKETING': 'digital marketing online advertising',
    'CONTENT_STRATEGY': 'content strategy marketing writing',
    'SEO': 'seo search optimization google',
    'SOCIAL_MEDIA': 'social media marketing community',
    'BRANDING': 'branding identity visual design',
    'GROWTH_HACKING': 'growth hacking marketing acquisition',
    'COPYWRITING': 'copywriting content writing marketing',
    'STORYTELLING': 'storytelling narrative communication',

    // Career
    'INTERVIEW_PREP': 'interview preparation practice coaching',
    'RESUME_REVIEW': 'resume review cv feedback',
    'CAREER_COACHING': 'career coaching guidance development',
    'PUBLIC_SPEAKING': 'public speaking presentation communication',
    'NETWORKING': 'networking connections professional',
    'LEADERSHIP': 'leadership management team development',
    'TEAM_MANAGEMENT': 'team management leadership people',

    // Mobile Development
    'REACT_NATIVE': 'react native mobile app development',
    'FLUTTER': 'flutter mobile app development',
    'IOS': 'ios apple mobile development',
    'ANDROID': 'android mobile app development',
    'SWIFT': 'swift ios apple programming',
    'KOTLIN': 'kotlin android programming',
    'MOBILE_UI': 'mobile ui design interface',
    'APP_STORE': 'app store publishing deployment',
  };

  return skillMapping[skill] || skill.toLowerCase().replace(/_/g, ' ');
}

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
            detailedGoals: true,
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
    // Map skills to embedding-friendly text for better semantic matching
    const mappedSkills = (mentee.skills || []).map(mapSkillToEmbeddingText);
    const skillsText = mappedSkills.join(' ').repeat(3); // 3x weight

    // Use detailedGoals if available (much better for matching), fallback to enum goals
    let goalsText = '';
    if (mentee.mentee?.detailedGoals) {
      // Detailed goals get 5x weight for better semantic matching
      goalsText = mentee.mentee.detailedGoals.repeat(5);
      console.log('✨ Using detailed goals for enhanced matching');
    } else {
      // Fallback to enum goals with 2x weight
      goalsText = (mentee.mentee?.goals?.map((g: any) => g.toString()) || []).join(' ').repeat(2);
    }

    const bioText = mentee.bio || '';
    const expText = mentee.experienceLevel || '';

    const menteeText = `${skillsText} ${goalsText} ${bioText} ${expText}`;

    console.log('🔍 Mentee Skills Mapped:', {
      original: mentee.skills?.slice(0, 3),
      mapped: mappedSkills.slice(0, 3)
    });


    const formattedMentors = mentors.map(mentor => {
      // Map mentor skills to embedding-friendly text for matching
      const mappedMentorSkills = (mentor.skills || []).map(mapSkillToEmbeddingText);

      return {
        id: mentor.id,
        name: mentor.name,
        email: mentor.email,
        bio: mentor.bio || '',
        skills: mappedMentorSkills, // Use mapped skills for matching algorithm
        originalSkills: mentor.skills || [], // Keep original skills for display
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
      };
    });

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
        skills: (mentor as any).originalSkills || mentor.skills, // Use original enum skills for display
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