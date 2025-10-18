import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Verifying Mentee Detailed Goals\n');
  console.log('='.repeat(80));

  const mentees = await prisma.mentee.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          skills: true,
        }
      }
    }
  });

  mentees.forEach((mentee, index) => {
    console.log(`\n${index + 1}. ${mentee.user.name} (${mentee.user.email})`);
    console.log(`   Skills: ${mentee.user.skills.join(', ')}`);
    console.log(`   Goal Categories: ${mentee.goals.join(', ')}`);
    console.log(`\n   Detailed Goals:`);
    console.log(`   ${mentee.detailedGoals || 'Not set'}`);
    console.log('\n' + '-'.repeat(80));
  });

  console.log(`\n✅ Verification complete. ${mentees.length} mentees have detailed goals set.`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
