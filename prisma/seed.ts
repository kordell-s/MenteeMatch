import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.task.deleteMany();
  await prisma.mentorshipRequest.deleteMany();
  await prisma.mentorship.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.session.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.mentor.deleteMany();
  await prisma.mentee.deleteMany();
  await prisma.user.deleteMany();

  // Create test password (same for all test users for easy testing)
  // Password: Test123! (meets all validation requirements)
  const hashedPassword = await bcrypt.hash("Test123!", 10);

  console.log("👥 Creating test users...");

  // Create Mentors
  const mentor1 = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Senior Full-Stack Developer with 8 years of experience. Passionate about teaching React and Node.js.",
      title: "Senior Software Engineer",
      company: "Tech Corp",
      school: "MIT",
      location: "San Francisco, CA",
      experienceLevel: "SENIOR",
      skills: ["REACT", "NODE_JS", "TYPESCRIPT", "SYSTEM_DESIGN", "AWS"],
      languages: ["English", "Spanish"],
      availability: ["MONDAY", "WEDNESDAY", "FRIDAY"],
      timeAvailability: ["EVENING", "LATE_EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.8,
    },
  });

  const mentor2 = await prisma.user.create({
    data: {
      name: "David Chen",
      email: "david.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Data Science expert specializing in Machine Learning and AI. Love helping beginners start their ML journey.",
      title: "Lead Data Scientist",
      company: "DataCorp",
      school: "Stanford University",
      location: "Seattle, WA",
      experienceLevel: "LEAD",
      skills: ["PYTHON", "MACHINE_LEARNING", "DATA_SCIENCE", "STATISTICS", "MLOPS"],
      languages: ["English", "Mandarin"],
      availability: ["TUESDAY", "THURSDAY", "SATURDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
    },
  });

  const mentor3 = await prisma.user.create({
    data: {
      name: "Emily Rodriguez",
      email: "emily.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "UX Designer with a passion for creating accessible and beautiful interfaces. Specialized in design systems.",
      title: "Senior UX Designer",
      company: "Design Studio",
      school: "RISD",
      location: "New York, NY",
      experienceLevel: "SENIOR",
      skills: ["UX", "UI", "FIGMA", "DESIGN_SYSTEMS", "ACCESSIBILITY"],
      languages: ["English", "French"],
      availability: ["MONDAY", "TUESDAY", "THURSDAY"],
      timeAvailability: ["AFTERNOON", "EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.7,
    },
  });

  const mentor4 = await prisma.user.create({
    data: {
      name: "Michael Zhang",
      email: "michael.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Mobile development expert specializing in React Native and Flutter. Built apps with millions of downloads.",
      title: "Senior Mobile Engineer",
      company: "AppTech",
      school: "Carnegie Mellon",
      location: "San Francisco, CA",
      experienceLevel: "SENIOR",
      skills: ["REACT", "JAVASCRIPT", "TYPESCRIPT"],
      languages: ["English", "Mandarin"],
      availability: ["WEDNESDAY", "THURSDAY", "SATURDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
    },
  });

  const mentor5 = await prisma.user.create({
    data: {
      name: "Priya Patel",
      email: "priya.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Backend architect specializing in Node.js, microservices, and cloud infrastructure. Love mentoring on system design.",
      title: "Principal Backend Engineer",
      company: "CloudScale",
      school: "Georgia Tech",
      location: "Atlanta, GA",
      experienceLevel: "LEAD",
      skills: ["NODE_JS", "TYPESCRIPT", "AWS", "MICROSERVICES", "SYSTEM_DESIGN"],
      languages: ["English", "Hindi"],
      availability: ["MONDAY", "WEDNESDAY", "FRIDAY"],
      timeAvailability: ["EVENING", "LATE_EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.8,
    },
  });

  const mentor6 = await prisma.user.create({
    data: {
      name: "Carlos Rivera",
      email: "carlos.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "DevOps engineer helping teams scale from startup to enterprise. Expert in Docker, Kubernetes, and CI/CD.",
      title: "DevOps Lead",
      company: "Infrastructure Co",
      school: "UT Austin",
      location: "Austin, TX",
      experienceLevel: "SENIOR",
      skills: ["DOCKER", "KUBERNETES", "DEVOPS", "AWS", "PYTHON"],
      languages: ["English", "Spanish"],
      availability: ["TUESDAY", "THURSDAY", "SATURDAY"],
      timeAvailability: ["AFTERNOON", "EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.6,
    },
  });

  const mentor7 = await prisma.user.create({
    data: {
      name: "Lisa Anderson",
      email: "lisa.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Product manager turned engineering leader. Help developers transition into product and leadership roles.",
      title: "Director of Engineering",
      company: "Product Labs",
      school: "Northwestern",
      location: "Chicago, IL",
      experienceLevel: "LEAD",
      skills: ["PRODUCT_MANAGEMENT", "LEADERSHIP", "AGILE", "TEAM_MANAGEMENT"],
      languages: ["English"],
      availability: ["MONDAY", "TUESDAY", "WEDNESDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.7,
    },
  });

  const mentor8 = await prisma.user.create({
    data: {
      name: "Raj Kumar",
      email: "raj.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Full-stack JavaScript developer specializing in MERN stack. Passionate about teaching beginners the fundamentals.",
      title: "Senior JavaScript Developer",
      company: "WebWorks",
      school: "IIT Delhi",
      location: "Remote",
      experienceLevel: "SENIOR",
      skills: ["JAVASCRIPT", "REACT", "NODE_JS", "NOSQL"],
      languages: ["English", "Hindi"],
      availability: ["MONDAY", "WEDNESDAY", "FRIDAY", "SUNDAY"],
      timeAvailability: ["EVENING", "LATE_EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
    },
  });

  // Create Mentees
  const mentee1 = await prisma.user.create({
    data: {
      name: "Alex Thompson",
      email: "alex.mentee@test.com",
      password: hashedPassword,
      role: "MENTEE",
      bio: "Computer Science student eager to learn web development and land my first internship.",
      title: "CS Student",
      school: "UC Berkeley",
      location: "Berkeley, CA",
      experienceLevel: "STUDENT",
      skills: ["JAVASCRIPT", "PYTHON", "SQL"],
      languages: ["English"],
      availability: ["MONDAY", "WEDNESDAY", "FRIDAY", "SATURDAY"],
      timeAvailability: ["EVENING", "LATE_EVENING"],
      verified: true,
      profileComplete: true,
    },
  });

  const mentee2 = await prisma.user.create({
    data: {
      name: "Maria Garcia",
      email: "maria.mentee@test.com",
      password: hashedPassword,
      role: "MENTEE",
      bio: "Career changer from marketing to data science. Looking for guidance on ML fundamentals.",
      title: "Junior Data Analyst",
      company: "Analytics Inc",
      school: "NYU",
      location: "New York, NY",
      experienceLevel: "ENTRY",
      skills: ["PYTHON", "SQL", "STATISTICS"],
      languages: ["English", "Spanish"],
      availability: ["TUESDAY", "THURSDAY", "SUNDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
    },
  });

  const mentee3 = await prisma.user.create({
    data: {
      name: "James Wilson",
      email: "james.mentee@test.com",
      password: hashedPassword,
      role: "MENTEE",
      bio: "Bootcamp graduate looking to improve my portfolio and prepare for technical interviews.",
      title: "Aspiring Software Developer",
      school: "General Assembly",
      location: "Austin, TX",
      experienceLevel: "ENTRY",
      skills: ["REACT", "NODE_JS", "JAVASCRIPT"],
      languages: ["English"],
      availability: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      timeAvailability: ["AFTERNOON", "EVENING"],
      verified: true,
      profileComplete: true,
    },
  });

  // Create Mentor profiles
  await prisma.mentor.create({
    data: {
      userId: mentor1.id,
      specialization: [
        "FULLSTACK_DEVELOPMENT",
        "FRONTEND_DEVELOPMENT",
        "CAREER_COACHING",
        "TECHNICAL_INTERVIEWING",
      ],
      pricing: 75.0,
      category: "TECHNOLOGY",
    },
  });

  await prisma.mentor.create({
    data: {
      userId: mentor2.id,
      specialization: [
        "MACHINE_LEARNING_ENGINEERING",
        "DATA_ANALYSIS",
        "DATA_ENGINEERING",
        "CAREER_COACHING",
      ],
      pricing: 100.0,
      category: "TECHNOLOGY",
    },
  });

  await prisma.mentor.create({
    data: {
      userId: mentor3.id,
      specialization: [
        "UI_UX_DESIGN",
        "PRODUCT_DESIGN",
        "USER_RESEARCH",
        "DESIGN_SYSTEMS",
      ],
      pricing: 85.0,
      category: "DESIGN",
    },
  });

  await prisma.mentor.create({
    data: {
      userId: mentor4.id,
      specialization: [
        "MOBILE_DEVELOPMENT",
        "FRONTEND_DEVELOPMENT",
        "WEB_DEVELOPMENT",
      ],
      pricing: 80.0,
      category: "TECHNOLOGY",
    },
  });

  await prisma.mentor.create({
    data: {
      userId: mentor5.id,
      specialization: [
        "BACKEND_DEVELOPMENT",
        "SYSTEM_ARCHITECTURE",
        "CLOUD_COMPUTING",
      ],
      pricing: 95.0,
      category: "TECHNOLOGY",
    },
  });

  await prisma.mentor.create({
    data: {
      userId: mentor6.id,
      specialization: [
        "DEVOPS_ENGINEERING",
        "CLOUD_COMPUTING",
        "INFRASTRUCTURE_MANAGEMENT",
        "DEPLOYMENT_AUTOMATION",
      ],
      pricing: 90.0,
      category: "TECHNOLOGY",
    },
  });

  await prisma.mentor.create({
    data: {
      userId: mentor7.id,
      specialization: [
        "PRODUCT_MANAGEMENT",
        "LEADERSHIP_DEVELOPMENT",
        "TEAM_BUILDING",
        "STRATEGIC_PLANNING",
      ],
      pricing: 120.0,
      category: "BUSINESS",
    },
  });

  await prisma.mentor.create({
    data: {
      userId: mentor8.id,
      specialization: [
        "FULLSTACK_DEVELOPMENT",
        "WEB_DEVELOPMENT",
        "FRONTEND_DEVELOPMENT",
        "BACKEND_DEVELOPMENT",
      ],
      pricing: 70.0,
      category: "TECHNOLOGY",
    },
  });

  // Create Mentee profiles with goals
  await prisma.mentee.create({
    data: {
      userId: mentee1.id,
      goals: ["LEARN_CODING", "BUILD_PROJECTS", "INTERVIEW_PREP"],
    },
  });

  await prisma.mentee.create({
    data: {
      userId: mentee2.id,
      goals: ["TRANSITION_CAREER", "LEARN_CODING", "CAREER_GUIDANCE"],
    },
  });

  await prisma.mentee.create({
    data: {
      userId: mentee3.id,
      goals: ["INTERVIEW_PREP", "RESUME_REVIEW", "BUILD_PROJECTS"],
    },
  });

  console.log("🤝 Creating mentorship relationships...");

  // Create some mentorships
  const mentorship1 = await prisma.mentorship.create({
    data: {
      mentorId: mentor1.id,
      menteeId: mentee1.id,
      status: "ACCEPTED",
    },
  });

  const mentorship2 = await prisma.mentorship.create({
    data: {
      mentorId: mentor2.id,
      menteeId: mentee2.id,
      status: "ACCEPTED",
    },
  });

  // Create a pending mentorship request
  await prisma.mentorshipRequest.create({
    data: {
      mentorId: mentor3.id,
      menteeId: mentee3.id,
      offeringType: "Portfolio Review",
      message: "Hi Emily! I'd love to get feedback on my design portfolio.",
      status: "PENDING",
    },
  });

  console.log("📅 Creating sessions...");

  // Create some sessions
  await prisma.session.create({
    data: {
      mentorId: mentor1.id,
      menteeId: mentee1.id,
      date: new Date("2025-10-20T18:00:00"),
      time: "18:00",
      duration: 60,
      status: "CONFIRMED",
      title: "React Fundamentals Deep Dive",
      description: "Learn React hooks and component patterns",
      offeringType: "Technical Session",
    },
  });

  await prisma.session.create({
    data: {
      mentorId: mentor2.id,
      menteeId: mentee2.id,
      date: new Date("2025-10-18T14:00:00"),
      time: "14:00",
      duration: 90,
      status: "COMPLETED",
      title: "Introduction to Machine Learning",
      description: "Overview of ML algorithms and when to use them",
      offeringType: "Technical Session",
      feedback: "Great session! Maria asked excellent questions.",
      rating: 5.0,
    },
  });

  console.log("✅ Creating tasks...");

  // Create some tasks
  await prisma.task.create({
    data: {
      mentorId: mentor1.id,
      menteeId: mentee1.id,
      title: "Build a Todo App with React",
      description: "Create a full-featured todo application using React hooks and local storage",
      dueDate: new Date("2025-10-25"),
      status: "IN_PROGRESS",
      goalTag: "BUILD_PROJECTS",
    },
  });

  await prisma.task.create({
    data: {
      mentorId: mentor1.id,
      menteeId: mentee1.id,
      title: "Complete FreeCodeCamp JavaScript Course",
      description: "Finish the basic JavaScript certification",
      dueDate: new Date("2025-10-30"),
      status: "PENDING",
      goalTag: "LEARN_CODING",
    },
  });

  await prisma.task.create({
    data: {
      mentorId: mentor2.id,
      menteeId: mentee2.id,
      title: "Study Linear Regression",
      description: "Complete the linear regression module on Coursera",
      dueDate: new Date("2025-10-22"),
      status: "COMPLETED",
      completed: true,
      goalTag: "LEARN_CODING",
    },
  });

  console.log("💬 Creating conversations and messages...");

  // Create conversations with messages
  const conversation1 = await prisma.conversation.create({
    data: {
      mentorId: mentor1.id,
      menteeId: mentee1.id,
      lastMessageAt: new Date(),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation1.id,
      senderId: mentee1.id,
      receiverId: mentor1.id,
      content: "Hi Sarah! Thanks for accepting my mentorship request!",
      timestamp: new Date("2025-10-13T10:00:00"),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation1.id,
      senderId: mentor1.id,
      receiverId: mentee1.id,
      content: "Hi Alex! I'm excited to work with you. When would you like to have our first session?",
      timestamp: new Date("2025-10-13T10:15:00"),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation1.id,
      senderId: mentee1.id,
      receiverId: mentor1.id,
      content: "How about next Monday at 6 PM?",
      timestamp: new Date("2025-10-13T10:30:00"),
    },
  });

  const conversation2 = await prisma.conversation.create({
    data: {
      mentorId: mentor2.id,
      menteeId: mentee2.id,
      lastMessageAt: new Date(),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation2.id,
      senderId: mentor2.id,
      receiverId: mentee2.id,
      content: "Great session today Maria! Don't forget to complete that linear regression assignment.",
      timestamp: new Date("2025-10-13T15:00:00"),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation2.id,
      senderId: mentee2.id,
      receiverId: mentor2.id,
      content: "Thank you David! I'll have it done by Friday.",
      timestamp: new Date("2025-10-13T15:10:00"),
    },
  });

  console.log("⭐ Creating ratings...");

  // Create ratings
  await prisma.rating.create({
    data: {
      userId: mentor1.id,
      ratedById: mentee1.id,
      ratingValue: 5.0,
    },
  });

  await prisma.rating.create({
    data: {
      userId: mentor2.id,
      ratedById: mentee2.id,
      ratingValue: 5.0,
    },
  });

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📝 Test Accounts (all use password: Test123!):");
  console.log("\nMentors (8 total):");
  console.log("  - sarah.mentor@test.com (Full-Stack: React/Node.js)");
  console.log("  - david.mentor@test.com (Data Science/ML)");
  console.log("  - emily.mentor@test.com (UX/UI Design)");
  console.log("  - michael.mentor@test.com (Mobile: React Native)");
  console.log("  - priya.mentor@test.com (Backend: Node.js/AWS)");
  console.log("  - carlos.mentor@test.com (DevOps/Cloud)");
  console.log("  - lisa.mentor@test.com (Product/Leadership)");
  console.log("  - raj.mentor@test.com (MERN Stack)");
  console.log("\nMentees (3 total):");
  console.log("  - alex.mentee@test.com (CS Student - Web Dev)");
  console.log("  - maria.mentee@test.com (Career Changer - Data Science)");
  console.log("  - james.mentee@test.com (Bootcamp Grad - Full-Stack)");
  console.log("\n🎉 You can now log in with any of these accounts!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
