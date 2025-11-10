import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.message.deleteMany();
  await prisma.roadmapResource.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.roadmap.deleteMany();
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
      gender: "FEMALE",
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
      gender: "MALE",
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
      gender: "FEMALE",
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
      skills: ["JAVASCRIPT", "REACT"],
      languages: ["English", "Mandarin"],
      availability: ["WEDNESDAY", "THURSDAY", "SATURDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
      gender: "MALE",
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
      gender: "FEMALE",
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
      gender: "MALE",
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
      skills: ["PRODUCT_MANAGEMENT", "AGILE", "TEAM_MANAGEMENT", "LEADERSHIP"],
      languages: ["English"],
      availability: ["MONDAY", "TUESDAY", "WEDNESDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.7,
      gender: "FEMALE",
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
      gender: "MALE",
    },
  });

  // BUSINESS MENTORS (5 more)
  const mentor9 = await prisma.user.create({
    data: {
      name: "Jennifer Adams",
      email: "jennifer.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "MBA graduate turned entrepreneur. Founded 2 successful startups. Help aspiring entrepreneurs launch their ventures.",
      title: "Founder & CEO",
      company: "StartupLab",
      school: "Harvard Business School",
      location: "Boston, MA",
      experienceLevel: "LEAD",
      skills: ["BUSINESS_STRATEGY", "STARTUPS", "LEADERSHIP", "PUBLIC_SPEAKING"],
      languages: ["English"],
      availability: ["TUESDAY", "THURSDAY", "FRIDAY"],
      timeAvailability: ["AFTERNOON", "EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
      gender: "FEMALE",
    },
  });

  const mentor10 = await prisma.user.create({
    data: {
      name: "Marcus Thompson",
      email: "marcus.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Financial analyst with 12 years in investment banking. Specialize in corporate finance and financial modeling.",
      title: "Senior Investment Banker",
      company: "Goldman Sachs",
      school: "Wharton School",
      location: "New York, NY",
      experienceLevel: "SENIOR",
      skills: ["BUSINESS_STRATEGY", "STATISTICS", "SQL", "DATA_SCIENCE"],
      languages: ["English"],
      availability: ["MONDAY", "WEDNESDAY", "SATURDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.7,
      gender: "MALE",
    },
  });

  const mentor11 = await prisma.user.create({
    data: {
      name: "Sophia Martinez",
      email: "sophia.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Human Resources Director passionate about talent development and organizational culture. 10+ years experience.",
      title: "HR Director",
      company: "Fortune 500 Tech",
      school: "Cornell University",
      location: "San Francisco, CA",
      experienceLevel: "SENIOR",
      skills: ["LEADERSHIP", "TEAM_MANAGEMENT", "CAREER_COACHING", "PUBLIC_SPEAKING"],
      languages: ["English", "Spanish"],
      availability: ["TUESDAY", "WEDNESDAY", "THURSDAY"],
      timeAvailability: ["AFTERNOON", "EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.8,
      gender: "FEMALE",
    },
  });

  const mentor12 = await prisma.user.create({
    data: {
      name: "Robert Kim",
      email: "robert.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Operations consultant helping businesses scale efficiently. Former McKinsey consultant with expertise in process optimization.",
      title: "Operations Consultant",
      company: "McKinsey & Company",
      school: "Stanford GSB",
      location: "Los Angeles, CA",
      experienceLevel: "LEAD",
      skills: ["BUSINESS_STRATEGY", "AGILE", "LEADERSHIP", "TEAM_MANAGEMENT"],
      languages: ["English", "Korean"],
      availability: ["MONDAY", "THURSDAY", "FRIDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
      gender: "MALE",
    },
  });

  const mentor13 = await prisma.user.create({
    data: {
      name: "Amanda Foster",
      email: "amanda.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Sales executive with track record of building high-performing teams. Expert in B2B sales and account management.",
      title: "VP of Sales",
      company: "SaaS Unicorn",
      school: "UC Berkeley Haas",
      location: "San Francisco, CA",
      experienceLevel: "LEAD",
      skills: ["BUSINESS_STRATEGY", "DIGITAL_MARKETING", "LEADERSHIP", "TEAM_MANAGEMENT"],
      languages: ["English"],
      availability: ["TUESDAY", "WEDNESDAY", "FRIDAY"],
      timeAvailability: ["AFTERNOON", "EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.8,
      gender: "FEMALE",
    },
  });

  // DESIGN MENTORS (5 more)
  const mentor14 = await prisma.user.create({
    data: {
      name: "James Lee",
      email: "james.l.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Creative director with 15 years in branding and visual identity. Worked with Fortune 500 brands.",
      title: "Creative Director",
      company: "Ogilvy",
      school: "Parsons School of Design",
      location: "New York, NY",
      experienceLevel: "LEAD",
      skills: ["BRANDING", "UX", "UI", "DESIGN_SYSTEMS"],
      languages: ["English"],
      availability: ["MONDAY", "TUESDAY", "THURSDAY"],
      timeAvailability: ["AFTERNOON", "EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
      gender: "MALE",
    },
  });

  const mentor15 = await prisma.user.create({
    data: {
      name: "Nina Patel",
      email: "nina.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Product designer focused on mobile-first experiences. Ex-Airbnb designer passionate about design systems.",
      title: "Senior Product Designer",
      company: "Airbnb",
      school: "Rhode Island School of Design",
      location: "San Francisco, CA",
      experienceLevel: "SENIOR",
      skills: ["UX", "UI", "FIGMA", "DESIGN_SYSTEMS"],
      languages: ["English", "Hindi"],
      availability: ["TUESDAY", "WEDNESDAY", "SATURDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.8,
      gender: "FEMALE",
    },
  });

  const mentor16 = await prisma.user.create({
    data: {
      name: "Oliver Wright",
      email: "oliver.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Motion graphics designer and animator. Specialize in explainer videos and brand animations for startups.",
      title: "Motion Designer",
      company: "Buck Design",
      school: "CalArts",
      location: "Los Angeles, CA",
      experienceLevel: "SENIOR",
      skills: ["MOTION_DESIGN", "UX", "UI", "FIGMA"],
      languages: ["English"],
      availability: ["MONDAY", "WEDNESDAY", "FRIDAY"],
      timeAvailability: ["AFTERNOON", "EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.7,
      gender: "MALE",
    },
  });

  const mentor17 = await prisma.user.create({
    data: {
      name: "Isabella Romano",
      email: "isabella.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "UX researcher specializing in user testing and qualitative research. Help teams build user-centered products.",
      title: "Lead UX Researcher",
      company: "Meta",
      school: "Carnegie Mellon HCI",
      location: "Seattle, WA",
      experienceLevel: "LEAD",
      skills: ["UX", "USER_RESEARCH", "FIGMA", "ACCESSIBILITY"],
      languages: ["English", "Italian"],
      availability: ["TUESDAY", "THURSDAY", "SATURDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
      gender: "FEMALE",
    },
  });

  const mentor18 = await prisma.user.create({
    data: {
      name: "Daniel Brown",
      email: "daniel.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Graphic designer specializing in print and editorial design. 10+ years creating stunning publications.",
      title: "Senior Graphic Designer",
      company: "Pentagram",
      school: "Yale School of Art",
      location: "New York, NY",
      experienceLevel: "SENIOR",
      skills: ["UX", "UI", "FIGMA", "BRANDING"],
      languages: ["English"],
      availability: ["MONDAY", "WEDNESDAY", "FRIDAY"],
      timeAvailability: ["AFTERNOON", "EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.8,
      gender: "MALE",
    },
  });

  // MARKETING MENTORS (5)
  const mentor19 = await prisma.user.create({
    data: {
      name: "Rachel Green",
      email: "rachel.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Digital marketing strategist with expertise in SEO, SEM, and content marketing. Grew startups from 0 to millions in revenue.",
      title: "Head of Growth",
      company: "Growth Agency",
      school: "Northwestern Kellogg",
      location: "Chicago, IL",
      experienceLevel: "LEAD",
      skills: ["DIGITAL_MARKETING", "SEO", "GROWTH_HACKING", "CONTENT_STRATEGY"],
      languages: ["English"],
      availability: ["MONDAY", "TUESDAY", "THURSDAY"],
      timeAvailability: ["AFTERNOON", "EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
      gender: "FEMALE",
    },
  });

  const mentor20 = await prisma.user.create({
    data: {
      name: "Kevin Wong",
      email: "kevin.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Social media marketing expert. Built brands with millions of followers across Instagram, TikTok, and YouTube.",
      title: "Social Media Director",
      company: "Influencer Marketing Co",
      school: "USC Annenberg",
      location: "Los Angeles, CA",
      experienceLevel: "SENIOR",
      skills: ["SOCIAL_MEDIA", "CONTENT_STRATEGY", "DIGITAL_MARKETING", "COPYWRITING"],
      languages: ["English", "Cantonese"],
      availability: ["TUESDAY", "WEDNESDAY", "SATURDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.8,
      gender: "MALE",
    },
  });

  const mentor21 = await prisma.user.create({
    data: {
      name: "Laura Mitchell",
      email: "laura.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Brand strategist helping companies define their unique voice and positioning. Former VP Marketing at Nike.",
      title: "Brand Strategist",
      company: "Independent",
      school: "Columbia Business School",
      location: "Portland, OR",
      experienceLevel: "LEAD",
      skills: ["BRANDING", "DIGITAL_MARKETING", "CONTENT_STRATEGY", "BUSINESS_STRATEGY"],
      languages: ["English"],
      availability: ["MONDAY", "WEDNESDAY", "FRIDAY"],
      timeAvailability: ["AFTERNOON", "EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
      gender: "FEMALE",
    },
  });

  const mentor22 = await prisma.user.create({
    data: {
      name: "Tyler Johnson",
      email: "tyler.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Email marketing specialist. Expert in automation, segmentation, and conversion optimization for e-commerce.",
      title: "Email Marketing Manager",
      company: "Shopify",
      school: "University of Texas",
      location: "Austin, TX",
      experienceLevel: "SENIOR",
      skills: ["DIGITAL_MARKETING", "CONTENT_STRATEGY", "COPYWRITING", "SEO"],
      languages: ["English"],
      availability: ["TUESDAY", "THURSDAY", "SATURDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.7,
      gender: "MALE",
    },
  });

  const mentor23 = await prisma.user.create({
    data: {
      name: "Maya Singh",
      email: "maya.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Content marketing leader specializing in B2B SaaS. Built content programs that generated millions in pipeline.",
      title: "Content Marketing Director",
      company: "HubSpot",
      school: "MIT Sloan",
      location: "Boston, MA",
      experienceLevel: "LEAD",
      skills: ["CONTENT_STRATEGY", "COPYWRITING", "DIGITAL_MARKETING", "SEO"],
      languages: ["English", "Hindi"],
      availability: ["MONDAY", "WEDNESDAY", "FRIDAY"],
      timeAvailability: ["AFTERNOON", "EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
      gender: "FEMALE",
    },
  });

  // CREATIVE MENTORS (5)
  const mentor24 = await prisma.user.create({
    data: {
      name: "Christopher Davis",
      email: "christopher.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Award-winning photographer specializing in portrait and commercial photography. Published in major magazines.",
      title: "Commercial Photographer",
      company: "Independent",
      school: "School of Visual Arts",
      location: "New York, NY",
      experienceLevel: "SENIOR",
      skills: ["UX", "UI", "FIGMA", "BRANDING"],
      languages: ["English"],
      availability: ["TUESDAY", "THURSDAY", "SATURDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.8,
      gender: "MALE",
    },
  });

  const mentor25 = await prisma.user.create({
    data: {
      name: "Zoe Anderson",
      email: "zoe.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Video editor and filmmaker. Edited commercials for major brands and worked on Netflix documentaries.",
      title: "Senior Video Editor",
      company: "Post Production House",
      school: "AFI Conservatory",
      location: "Los Angeles, CA",
      experienceLevel: "SENIOR",
      skills: ["MOTION_DESIGN", "STORYTELLING", "UX", "UI"],
      languages: ["English"],
      availability: ["MONDAY", "WEDNESDAY", "FRIDAY"],
      timeAvailability: ["AFTERNOON", "EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
      gender: "FEMALE",
    },
  });

  const mentor26 = await prisma.user.create({
    data: {
      name: "Nathan Clark",
      email: "nathan.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Illustrator and concept artist for video games and animation. Worked on AAA games and Pixar films.",
      title: "Concept Artist",
      company: "Pixar Animation Studios",
      school: "CalArts",
      location: "San Francisco, CA",
      experienceLevel: "SENIOR",
      skills: ["UX", "UI", "FIGMA", "DESIGN_SYSTEMS"],
      languages: ["English"],
      availability: ["TUESDAY", "THURSDAY", "SATURDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.8,
      gender: "MALE",
    },
  });

  const mentor27 = await prisma.user.create({
    data: {
      name: "Victoria Hughes",
      email: "victoria.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "3D artist specializing in character modeling and texturing for games and film. 8 years in the industry.",
      title: "Senior 3D Artist",
      company: "Blizzard Entertainment",
      school: "Gnomon School",
      location: "Irvine, CA",
      experienceLevel: "SENIOR",
      skills: ["UX", "UI", "FIGMA", "DESIGN_SYSTEMS"],
      languages: ["English"],
      availability: ["MONDAY", "WEDNESDAY", "FRIDAY"],
      timeAvailability: ["AFTERNOON", "EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
      gender: "FEMALE",
    },
  });

  const mentor28 = await prisma.user.create({
    data: {
      name: "Samuel White",
      email: "samuel.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Copywriter and creative writer. Craft compelling stories for brands and helped authors publish their first books.",
      title: "Creative Copywriter",
      company: "Wieden+Kennedy",
      school: "Iowa Writers Workshop",
      location: "Portland, OR",
      experienceLevel: "SENIOR",
      skills: ["COPYWRITING", "STORYTELLING", "CONTENT_STRATEGY", "DIGITAL_MARKETING"],
      languages: ["English"],
      availability: ["TUESDAY", "THURSDAY", "SATURDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.7,
      gender: "MALE",
    },
  });

  // HEALTH MENTORS (5)
  const mentor29 = await prisma.user.create({
    data: {
      name: "Dr. Jessica Taylor",
      email: "jessica.t.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Registered dietitian helping people achieve sustainable health goals. Specialize in sports nutrition and meal planning.",
      title: "Registered Dietitian",
      company: "Nutrition Clinic",
      school: "Tufts University",
      location: "Boston, MA",
      experienceLevel: "SENIOR",
      skills: ["CAREER_COACHING", "PUBLIC_SPEAKING", "NETWORKING", "LEADERSHIP"],
      languages: ["English"],
      availability: ["MONDAY", "WEDNESDAY", "FRIDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
      gender: "FEMALE",
    },
  });

  const mentor30 = await prisma.user.create({
    data: {
      name: "Brandon Miller",
      email: "brandon.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Certified personal trainer and strength coach. Help clients transform their bodies and build lasting fitness habits.",
      title: "Personal Trainer",
      company: "Equinox",
      school: "NASM Certified",
      location: "Miami, FL",
      experienceLevel: "SENIOR",
      skills: ["CAREER_COACHING", "LEADERSHIP", "TEAM_MANAGEMENT", "PUBLIC_SPEAKING"],
      languages: ["English", "Spanish"],
      availability: ["TUESDAY", "THURSDAY", "SATURDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.8,
      gender: "MALE",
    },
  });

  const mentor31 = await prisma.user.create({
    data: {
      name: "Dr. Alicia Gomez",
      email: "alicia.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Clinical psychologist specializing in cognitive behavioral therapy. Help professionals manage stress and anxiety.",
      title: "Clinical Psychologist",
      company: "Private Practice",
      school: "Stanford University",
      location: "Palo Alto, CA",
      experienceLevel: "LEAD",
      skills: ["CAREER_COACHING", "PUBLIC_SPEAKING", "NETWORKING", "LEADERSHIP"],
      languages: ["English", "Spanish"],
      availability: ["MONDAY", "TUESDAY", "THURSDAY"],
      timeAvailability: ["AFTERNOON", "EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
      gender: "FEMALE",
    },
  });

  const mentor32 = await prisma.user.create({
    data: {
      name: "Eric Chen",
      email: "eric.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Yoga instructor and meditation teacher. Taught thousands of students to find balance and inner peace.",
      title: "Yoga Instructor",
      company: "Wellness Studio",
      school: "RYT-500 Certified",
      location: "San Diego, CA",
      experienceLevel: "SENIOR",
      skills: ["CAREER_COACHING", "PUBLIC_SPEAKING", "NETWORKING", "LEADERSHIP"],
      languages: ["English", "Mandarin"],
      availability: ["MONDAY", "WEDNESDAY", "FRIDAY", "SUNDAY"],
      timeAvailability: ["MORNING", "EVENING"],
      verified: true,
      profileComplete: true,
      rating: 4.8,
      gender: "MALE",
    },
  });

  const mentor33 = await prisma.user.create({
    data: {
      name: "Hannah Lewis",
      email: "hannah.mentor@test.com",
      password: hashedPassword,
      role: "MENTOR",
      bio: "Holistic health coach integrating nutrition, fitness, and mindset. Help busy professionals optimize their wellbeing.",
      title: "Health Coach",
      company: "Wellness Coaching",
      school: "Institute for Integrative Nutrition",
      location: "Austin, TX",
      experienceLevel: "SENIOR",
      skills: ["CAREER_COACHING", "LEADERSHIP", "PUBLIC_SPEAKING", "NETWORKING"],
      languages: ["English"],
      availability: ["TUESDAY", "THURSDAY", "SATURDAY"],
      timeAvailability: ["MORNING", "AFTERNOON"],
      verified: true,
      profileComplete: true,
      rating: 4.9,
      gender: "FEMALE",
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
      gender: "MALE",
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
      gender: "FEMALE",
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
      gender: "MALE",
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
      detailedGoals: "I'm a computer science student at UC Berkeley looking to master web development with JavaScript and React. I want to build impressive full-stack projects for my portfolio and prepare for technical interviews at top tech companies. I'm particularly interested in learning modern frontend frameworks, backend API development with Node.js, and database design. My goal is to land a software engineering internship at a FAANG company or promising startup.",
    },
  });

  await prisma.mentee.create({
    data: {
      userId: mentee2.id,
      goals: ["TRANSITION_CAREER", "LEARN_CODING", "CAREER_GUIDANCE"],
      detailedGoals: "I'm transitioning from a marketing career into data science and need guidance on machine learning fundamentals. I want to learn how to build predictive models, work with large datasets, and understand statistical analysis. I'm currently working as a junior data analyst but want to become a machine learning engineer. I need help with Python programming, data visualization, and understanding when to apply different ML algorithms. I'm also looking for career advice on making this transition successfully.",
    },
  });

  await prisma.mentee.create({
    data: {
      userId: mentee3.id,
      goals: ["INTERVIEW_PREP", "RESUME_REVIEW", "BUILD_PROJECTS"],
      detailedGoals: "I recently graduated from a coding bootcamp and need help preparing for technical interviews and building a strong portfolio. I know React and Node.js but want to deepen my understanding of system design, algorithms, and data structures. I need guidance on how to approach coding challenges, explain my thought process clearly, and build production-quality full-stack applications that will impress employers. I'm targeting mid-level frontend and full-stack developer positions.",
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

  console.log("🗺️  Creating roadmaps with milestones...");

  // Create roadmap for mentee1 (Alex) - Full-Stack Development Journey
  const roadmap1 = await prisma.roadmap.create({
    data: {
      mentorshipId: mentorship1.id,
      title: "Full-Stack Development Journey",
      description: "A comprehensive 12-week program to master modern full-stack development with React and Node.js",
      duration: 12,
      focusArea: "Full-Stack Web Development",
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-04-15"),
      status: "ACTIVE",
    },
  });

  // Milestone 1 for roadmap1
  const milestone1_1 = await prisma.milestone.create({
    data: {
      roadmapId: roadmap1.id,
      title: "JavaScript Fundamentals Mastery",
      description: "Deep dive into ES6+, async/await, closures, and functional programming",
      order: 1,
      dueDate: new Date("2025-02-05"),
      status: "COMPLETED",
      completedAt: new Date("2025-02-03"),
    },
  });

  await prisma.roadmapResource.create({
    data: {
      milestoneId: milestone1_1.id,
      title: "JavaScript.info Tutorial",
      url: "https://javascript.info",
      description: "Comprehensive modern JavaScript tutorial",
      resourceType: "LINK",
    },
  });

  await prisma.roadmapResource.create({
    data: {
      milestoneId: milestone1_1.id,
      title: "You Don't Know JS Book Series",
      url: "https://github.com/getify/You-Dont-Know-JS",
      description: "Deep dive into JavaScript mechanisms",
      resourceType: "DOCUMENT",
    },
  });

  // Milestone 2 for roadmap1
  const milestone1_2 = await prisma.milestone.create({
    data: {
      roadmapId: roadmap1.id,
      title: "React Fundamentals & Hooks",
      description: "Learn React components, hooks, state management, and component lifecycle",
      order: 2,
      dueDate: new Date("2025-02-26"),
      status: "IN_PROGRESS",
    },
  });

  await prisma.roadmapResource.create({
    data: {
      milestoneId: milestone1_2.id,
      title: "React Official Documentation",
      url: "https://react.dev",
      description: "Official React docs with interactive examples",
      resourceType: "LINK",
    },
  });

  await prisma.roadmapResource.create({
    data: {
      milestoneId: milestone1_2.id,
      title: "React Hooks Explained",
      url: "https://www.youtube.com/watch?v=dpw9EHDh2bM",
      description: "Comprehensive video tutorial on React hooks",
      resourceType: "VIDEO",
    },
  });

  await prisma.checkIn.create({
    data: {
      milestoneId: milestone1_2.id,
      mentorNotes: "Review progress on React hooks project. Discuss useEffect and custom hooks.",
      scheduledDate: new Date("2025-02-20T18:00:00"),
      status: "SCHEDULED",
    },
  });

  // Milestone 3 for roadmap1
  const milestone1_3 = await prisma.milestone.create({
    data: {
      roadmapId: roadmap1.id,
      title: "Backend with Node.js & Express",
      description: "Build RESTful APIs with Node.js, Express, and MongoDB",
      order: 3,
      dueDate: new Date("2025-03-19"),
      status: "NOT_STARTED",
    },
  });

  await prisma.roadmapResource.create({
    data: {
      milestoneId: milestone1_3.id,
      title: "Node.js Best Practices",
      url: "https://github.com/goldbergyoni/nodebestpractices",
      description: "Comprehensive Node.js best practices guide",
      resourceType: "DOCUMENT",
    },
  });

  // Milestone 4 for roadmap1
  const milestone1_4 = await prisma.milestone.create({
    data: {
      roadmapId: roadmap1.id,
      title: "Full-Stack Project: Build a Social Media App",
      description: "Combine all skills to build a complete full-stack application with authentication",
      order: 4,
      dueDate: new Date("2025-04-15"),
      status: "NOT_STARTED",
    },
  });

  await prisma.checkIn.create({
    data: {
      milestoneId: milestone1_4.id,
      mentorNotes: "Final project review and deployment guidance",
      scheduledDate: new Date("2025-04-10T18:00:00"),
      status: "SCHEDULED",
    },
  });

  // Create roadmap for mentee2 (Maria) - Data Science Transition
  const roadmap2 = await prisma.roadmap.create({
    data: {
      mentorshipId: mentorship2.id,
      title: "Data Science Career Transition Roadmap",
      description: "Structured 8-week path from data analyst to machine learning engineer",
      duration: 8,
      focusArea: "Machine Learning & Data Science",
      startDate: new Date("2025-01-20"),
      endDate: new Date("2025-03-20"),
      status: "ACTIVE",
    },
  });

  // Milestone 1 for roadmap2
  const milestone2_1 = await prisma.milestone.create({
    data: {
      roadmapId: roadmap2.id,
      title: "Python for Data Science",
      description: "Master NumPy, Pandas, and data manipulation techniques",
      order: 1,
      dueDate: new Date("2025-02-03"),
      status: "COMPLETED",
      completedAt: new Date("2025-02-01"),
    },
  });

  await prisma.roadmapResource.create({
    data: {
      milestoneId: milestone2_1.id,
      title: "Python Data Science Handbook",
      url: "https://jakevdp.github.io/PythonDataScienceHandbook/",
      description: "Free online book covering NumPy, Pandas, Matplotlib, and Scikit-Learn",
      resourceType: "DOCUMENT",
    },
  });

  // Milestone 2 for roadmap2
  const milestone2_2 = await prisma.milestone.create({
    data: {
      roadmapId: roadmap2.id,
      title: "Statistics & Probability Foundations",
      description: "Learn statistical concepts essential for machine learning",
      order: 2,
      dueDate: new Date("2025-02-17"),
      status: "IN_PROGRESS",
    },
  });

  await prisma.roadmapResource.create({
    data: {
      milestoneId: milestone2_2.id,
      title: "StatQuest with Josh Starmer",
      url: "https://www.youtube.com/c/joshstarmer",
      description: "Excellent video series explaining statistics concepts",
      resourceType: "VIDEO",
    },
  });

  await prisma.checkIn.create({
    data: {
      milestoneId: milestone2_2.id,
      mentorNotes: "Review hypothesis testing and confidence intervals. Work through practice problems.",
      scheduledDate: new Date("2025-02-14T14:00:00"),
      status: "SCHEDULED",
    },
  });

  // Milestone 3 for roadmap2
  const milestone2_3 = await prisma.milestone.create({
    data: {
      roadmapId: roadmap2.id,
      title: "Machine Learning Algorithms",
      description: "Understand and implement supervised and unsupervised learning algorithms",
      order: 3,
      dueDate: new Date("2025-03-03"),
      status: "NOT_STARTED",
    },
  });

  await prisma.roadmapResource.create({
    data: {
      milestoneId: milestone2_3.id,
      title: "Scikit-Learn Documentation",
      url: "https://scikit-learn.org/stable/",
      description: "Official documentation with examples for all ML algorithms",
      resourceType: "LINK",
    },
  });

  await prisma.roadmapResource.create({
    data: {
      milestoneId: milestone2_3.id,
      title: "Machine Learning Crash Course",
      url: "https://developers.google.com/machine-learning/crash-course",
      description: "Google's fast-paced introduction to machine learning",
      resourceType: "LINK",
    },
  });

  // Milestone 4 for roadmap2
  const milestone2_4 = await prisma.milestone.create({
    data: {
      roadmapId: roadmap2.id,
      title: "Capstone ML Project",
      description: "Build an end-to-end ML project with data collection, model training, and deployment",
      order: 4,
      dueDate: new Date("2025-03-20"),
      status: "NOT_STARTED",
    },
  });

  await prisma.checkIn.create({
    data: {
      milestoneId: milestone2_4.id,
      mentorNotes: "Project review and career transition discussion",
      scheduledDate: new Date("2025-03-18T14:00:00"),
      status: "SCHEDULED",
    },
  });

  // Link some tasks to milestones
  await prisma.task.update({
    where: { id: (await prisma.task.findFirst({ where: { menteeId: mentee1.id } }))!.id },
    data: { milestoneId: milestone1_2.id },
  });

  await prisma.task.update({
    where: { id: (await prisma.task.findFirst({ where: { menteeId: mentee2.id } }))!.id },
    data: { milestoneId: milestone2_1.id },
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
