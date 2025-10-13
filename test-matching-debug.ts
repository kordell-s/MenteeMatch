import { PrismaClient } from "@prisma/client";
import { getMentorRecommendations } from "./lib/matching";

const prisma = new PrismaClient();

async function testMatching() {
  console.log("🔍 Testing Recommendation Algorithm with Seed Data\n");

  // Get Alex (mentee)
  const alex = await prisma.user.findUnique({
    where: { email: "alex.mentee@test.com" },
    include: { mentee: true },
  });

  if (!alex) {
    console.error("❌ Alex not found. Run: npm run seed");
    process.exit(1);
  }

  console.log("📋 Alex's Profile:");
  console.log("  Skills:", alex.skills);
  console.log("  Goals:", alex.mentee?.goals);
  console.log("  Bio:", alex.bio);
  console.log("  Experience:", alex.experienceLevel);
  console.log();

  // Create mentee text (same as API does)
  const menteeText = [
    ...(alex.skills || []),
    ...(alex.mentee?.goals?.map((g) => g.toString()) || []),
    alex.bio || "",
    alex.experienceLevel || "",
  ].join(" ");

  console.log("📝 Mentee Input Text:");
  console.log(menteeText);
  console.log();

  // Get all mentors
  const mentors = await prisma.user.findMany({
    where: {
      role: "MENTOR",
      mentor: { isNot: null },
    },
    include: { mentor: true },
  });

  console.log(`👥 Found ${mentors.length} mentors\n`);

  // Format mentors
  const formattedMentors = mentors.map((mentor) => ({
    id: mentor.id,
    name: mentor.name,
    email: mentor.email,
    bio: mentor.bio || "",
    skills: mentor.skills || [],
    profilePicture: mentor.profilePicture,
    title: mentor.title,
    company: mentor.company,
    location: mentor.location,
    rating: mentor.rating,
    languages: mentor.languages || [],
    pricing: mentor.mentor?.pricing || 0,
    category: mentor.mentor?.category || "TECHNOLOGY",
    specialization: mentor.mentor?.specialization || [],
    experienceLevel: mentor.experienceLevel || "ENTRY",
    availability: mentor.availability || [],
    timeAvailability: mentor.timeAvailability || [],
  }));

  // Show mentor profiles
  formattedMentors.forEach((mentor) => {
    console.log(`\n📊 ${mentor.name}:`);
    console.log(`  Skills: ${mentor.skills.join(", ")}`);
    console.log(`  Bio: ${mentor.bio.substring(0, 80)}...`);
  });

  console.log("\n\n🧠 Running Matching Algorithm...\n");

  // Run matching
  const results = await getMentorRecommendations(menteeText, formattedMentors);

  console.log("\n\n🎯 RESULTS:\n");
  results.forEach((result, index) => {
    console.log(`#${index + 1} ${result.name}`);
    console.log(`   Score: ${(result.score * 100).toFixed(1)}%`);
    console.log(`   Skills: ${result.skills.slice(0, 3).join(", ")}`);
    if (result._debug) {
      console.log(`   TF-IDF: ${result._debug.tfidfScore}`);
      console.log(`   Embedding: ${result._debug.embeddingScore}`);
    }
    console.log();
  });

  // Analyze why David might be ranking higher
  console.log("\n📈 ANALYSIS:\n");

  const sarah = results.find((r) => r.name.includes("Sarah"));
  const david = results.find((r) => r.name.includes("David"));

  if (sarah && david) {
    console.log("Sarah Johnson (Expected #1 for Alex):");
    console.log(`  Skills: ${sarah.skills.join(", ")}`);
    console.log(`  Score: ${(sarah.score * 100).toFixed(1)}%`);
    console.log();
    console.log("David Chen:");
    console.log(`  Skills: ${david.skills.join(", ")}`);
    console.log(`  Score: ${(david.score * 100).toFixed(1)}%`);
    console.log();

    if (david.score > sarah.score) {
      console.log("❌ ISSUE: David ranking higher than Sarah");
      console.log("   Alex wants: Web development (JavaScript, React, Node.js)");
      console.log("   Sarah offers: React, Node.js, TypeScript ✅");
      console.log("   David offers: Python, ML, Data Science ❌");
      console.log();
      console.log("💡 Possible causes:");
      console.log("   1. David's bio has more matching words");
      console.log("   2. Python skill matches Alex's Python skill");
      console.log("   3. Word embeddings finding false similarities");
    } else {
      console.log("✅ CORRECT: Sarah ranking higher than David");
    }
  }

  await prisma.$disconnect();
}

testMatching().catch(console.error);
