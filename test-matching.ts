import { getMentorRecommendations } from './lib/matching';
// 1. Updated mentee input to match database structure
const menteeInput = {
  skills: ['REACT', 'JAVASCRIPT', 'HTML', 'CSS'],
  goals: ['CAREER_GUIDANCE', 'LEARN_CODING'],
  interests: ['USER_EXPERIENCE', 'WEB_DEVELOPMENT', 'RESPONSIVE_DESIGN'],
  experienceLevel: 'ENTRY',
  bio: 'I am a frontend developer looking to improve my skills and get career guidance'
};

const mentors = [
  { 
    id: 1, 
    name: "Alice (Strong Match)", 
    skills: ['REACT', 'TYPESCRIPT', 'JAVASCRIPT'], 
    bio: "I am a senior frontend developer specializing in user interface design.",
    mentor: {
      specialization: ['UI', 'REACT', 'CAREER_COACHING'],
      category: 'TECHNOLOGY'
    }
  },
  { 
    id: 2, 
    name: "Bob (Medium Match)", 
    skills: ['JAVASCRIPT', 'NODE_JS', 'SQL'], 
    bio: "I build backend systems and APIs but also know frontend basics.",
    mentor: {
      specialization: ['SYSTEM_DESIGN', 'CAREER_COACHING'],
      category: 'TECHNOLOGY'
    }
  },
  { 
    id: 3, 
    name: "Charlie (Weak Match)", 
    skills: ['PYTHON', 'DATA_SCIENCE', 'MACHINE_LEARNING'], 
    bio: "I work with data and machine learning models.",
    mentor: {
      specialization: ['DATA_SCIENCE', 'MACHINE_LEARNING'],
      category: 'TECHNOLOGY'
    }
  },
  { 
    id: 4, 
    name: "Diana (Semantic Match)", 
    skills: ['FIGMA', 'UX', 'DESIGN_SYSTEMS'], 
    bio: "Passionate about creating accessible and beautiful user experiences.",
    mentor: {
      specialization: ['UX', 'UI', 'DESIGN_SYSTEMS'],
      category: 'DESIGN'
    }
  },
  { 
    id: 5, 
    name: "Eve (No Match)", 
    skills: ['BUSINESS_STRATEGY', 'MARKETING'], 
    bio: "I manage financial records and accounting tasks.",
    mentor: {
      specialization: ['BUSINESS_STRATEGY', 'MARKETING'],
      category: 'BUSINESS'
    }
  }
];

// 2. Updated function to handle database structure
const getMentorRecommendationsStructured = async (menteeInput: any, mentors: any[]) => {
  // Convert structured input to text for existing algorithm
  const menteeText = [
    ...menteeInput.skills,
    ...menteeInput.goals,
    ...menteeInput.interests,
    menteeInput.bio
  ].join(' ');
  
  // Enhanced mentors text to include all fields from database structure
  const enhancedMentors = mentors.map(mentor => ({
    ...mentor,
    fullText: [
      ...mentor.skills,
      mentor.bio,
      ...(mentor.mentor?.specialization || []),
      mentor.mentor?.category || ''
    ].join(' ')
  }));
  
  // Use existing function but with enhanced text
  return await getMentorRecommendations(menteeText, enhancedMentors);
};

// 3. Run the test
const runStructuredTest = async () => {
  console.log("Running structured recommendation test...");
  console.log("Mentee Profile:");
  console.log("  Skills:", menteeInput.skills);
  console.log("  Goals:", menteeInput.goals);
  console.log("  Interests:", menteeInput.interests);
  console.log("  Experience Level:", menteeInput.experienceLevel);
  
  try {
    const recommendations = await getMentorRecommendationsStructured(menteeInput, mentors);
    
    console.log("\n--- MENTOR RECOMMENDATIONS (Ranked) ---");
    recommendations.forEach(mentor => {
      console.log(`\nMentor: ${mentor.name}`);
      console.log(`  Score: ${mentor.score.toFixed(4)}`);
      console.log(`  Skills: ${mentor.skills.join(', ')}`);
      console.log(`  Specializations: ${mentor.specializations.join(', ')}`);
      console.log(`  Mentoring: ${mentor.mentoring.join(', ')}`);
    });

  } catch (error) {
    console.error("Test failed:", error);
  }
};

runStructuredTest();