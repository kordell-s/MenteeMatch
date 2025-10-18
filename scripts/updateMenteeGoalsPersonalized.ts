import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Updating mentees with personalized detailed goals...\n');

  // Personalized goals for each specific test mentee
  const personalizedGoals = {
    'alex.mentee@test.com': `I'm a Computer Science student eager to develop my web development skills, particularly in JavaScript and full-stack development. I want to learn how to build real-world applications using modern frameworks and best practices. I'm particularly interested in understanding how to write clean, maintainable code and learning industry-standard development workflows. I'm also preparing for technical interviews for my first internship and would love guidance on data structures, algorithms, and how to approach coding challenges effectively. Additionally, I want to build a strong portfolio of projects that demonstrate my abilities to potential employers.`,

    'maria.mentee@test.com': `I'm transitioning from a marketing career into data science and need mentorship to navigate this career change successfully. I have a foundation in Python and SQL, and I'm eager to develop my skills in machine learning, statistical analysis, and data visualization. I want to understand how to apply data science techniques to solve real business problems and how to communicate insights effectively to stakeholders. I'm also looking for guidance on building a portfolio of data science projects that showcase my analytical abilities and demonstrate my readiness for an entry-level data scientist role. Career advice on breaking into the field and understanding what employers are looking for would be incredibly valuable.`,

    'james.mentee@test.com': `I recently completed a coding bootcamp specializing in React and Node.js, and I'm now preparing to enter the job market as a junior full-stack developer. I need help strengthening my portfolio with impressive projects that showcase real-world problem-solving skills. I'm particularly interested in improving my understanding of system design, writing more efficient code, and learning advanced React patterns and Node.js best practices. I'm also preparing for technical interviews and need guidance on how to approach whiteboard coding challenges, explain my thought process clearly, and handle behavioral questions effectively. Additionally, I want help refining my resume to highlight my bootcamp projects and any freelance work in a way that appeals to hiring managers.`
  };

  for (const [email, detailedGoals] of Object.entries(personalizedGoals)) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true }
    });

    if (user) {
      await prisma.mentee.update({
        where: { userId: user.id },
        data: { detailedGoals }
      });

      console.log(`✅ Updated ${user.name} (${email}):`);
      console.log(`   ${detailedGoals.substring(0, 200)}...\n`);
    } else {
      console.log(`⚠️  User not found: ${email}\n`);
    }
  }

  console.log('🎉 All mentees updated with personalized detailed goals!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
