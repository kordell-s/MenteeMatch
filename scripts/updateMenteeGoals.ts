import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Fetching all mentees...\n');

  // Get all mentees with their user info
  const mentees = await prisma.mentee.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          skills: true,
          experienceLevel: true,
        }
      }
    }
  });

  console.log(`Found ${mentees.length} mentees:\n`);

  // Display current mentees
  mentees.forEach((mentee, index) => {
    console.log(`${index + 1}. ${mentee.user.name} (${mentee.user.email})`);
    console.log(`   Goals: ${mentee.goals.join(', ')}`);
    console.log(`   Skills: ${mentee.user.skills.join(', ')}`);
    console.log(`   Bio: ${mentee.user.bio?.substring(0, 100)}...`);
    console.log(`   Current detailedGoals: ${mentee.detailedGoals || 'Not set'}\n`);
  });

  console.log('\n🎯 Updating mentees with detailed goals based on their profiles...\n');

  // Update each mentee with contextual detailed goals
  for (const mentee of mentees) {
    const user = mentee.user;

    // Create detailed goals based on their profile
    let detailedGoals = '';

    // Base the detailed goals on their existing goals, skills, and bio
    if (mentee.goals.includes('LEARN_CODING')) {
      const primarySkill = user.skills[0] || 'programming';
      detailedGoals = `I want to develop my ${primarySkill.toLowerCase().replace(/_/g, ' ')} skills and learn industry best practices. I'm particularly interested in building real-world projects and understanding how to write clean, maintainable code. I'm looking for guidance on career development in tech and how to transition into a software development role.`;
    } else if (mentee.goals.includes('INTERVIEW_PREP')) {
      detailedGoals = `I'm preparing for technical interviews and want to improve my problem-solving skills. I need help with coding challenges, system design questions, and behavioral interview preparation. I'm also looking for guidance on how to present my experience effectively and negotiate job offers in the tech industry.`;
    } else if (mentee.goals.includes('CAREER_GUIDANCE')) {
      const expLevel = user.experienceLevel?.toLowerCase() || 'entry';
      detailedGoals = `As a ${expLevel}-level professional, I'm looking for career guidance to help me advance in my field. I want to understand what skills I should develop, how to position myself for promotions or new opportunities, and how to build a strong professional network. I'm also interested in learning about different career paths and finding the right direction for my long-term goals.`;
    } else if (mentee.goals.includes('BUILD_PROJECTS')) {
      detailedGoals = `I want to build meaningful projects that showcase my skills and help me learn new technologies. I'm looking for guidance on project ideas, architecture decisions, best practices, and how to present my work effectively in a portfolio. I also want to learn how to take projects from concept to deployment and maintain them professionally.`;
    } else if (mentee.goals.includes('TRANSITION_CAREER')) {
      detailedGoals = `I'm transitioning into a new career path and need guidance on making this change successfully. I want to understand what skills are most important to develop, how to build relevant experience, and how to present my transferable skills effectively. I'm looking for mentorship on navigating this transition and building confidence in my new direction.`;
    } else if (mentee.goals.includes('GET_INTO_TECH')) {
      detailedGoals = `I want to break into the tech industry and need guidance on where to start. I'm interested in learning what technologies and skills are in demand, how to build a portfolio that stands out, and how to network effectively in the tech community. I'm looking for mentorship on navigating the job search process and preparing for my first tech role.`;
    } else if (mentee.goals.includes('PUBLIC_SPEAKING')) {
      detailedGoals = `I want to improve my public speaking and presentation skills, particularly in technical contexts. I'm looking for guidance on how to communicate complex ideas clearly, engage audiences effectively, and build confidence when presenting. I'm also interested in opportunities for speaking at conferences or meetups.`;
    } else if (mentee.goals.includes('RESUME_REVIEW')) {
      detailedGoals = `I need help optimizing my resume and LinkedIn profile to stand out in the job market. I want to learn how to effectively highlight my achievements, tailor my application materials for specific roles, and present my experience in a compelling way. I'm also looking for guidance on building a personal brand.`;
    } else {
      // Generic fallback
      const skills = user.skills.slice(0, 3).join(', ').toLowerCase().replace(/_/g, ' ');
      detailedGoals = `I'm looking to grow my skills in ${skills} and advance my career. I want to learn best practices, build meaningful projects, and receive guidance on professional development. I'm seeking mentorship to help me achieve my career goals and navigate challenges in my field.`;
    }

    // Update the mentee
    await prisma.mentee.update({
      where: { userId: user.id },
      data: { detailedGoals }
    });

    console.log(`✅ Updated ${user.name}:`);
    console.log(`   ${detailedGoals.substring(0, 150)}...\n`);
  }

  console.log('🎉 All mentees updated successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
