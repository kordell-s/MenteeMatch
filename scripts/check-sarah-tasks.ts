import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find Sarah
  const sarah = await prisma.user.findUnique({
    where: { email: "sarah.mentor@test.com" },
    select: { id: true, name: true, email: true },
  });

  if (!sarah) {
    console.log("❌ Sarah not found");
    return;
  }

  console.log("✅ Found Sarah:", sarah);

  // Find tasks assigned by Sarah
  const tasks = await prisma.task.findMany({
    where: {
      mentorId: sarah.id,
    },
    include: {
      mentee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { dueDate: "asc" },
    ],
  });

  console.log(`\n✅ Found ${tasks.length} tasks assigned by Sarah:`);
  tasks.forEach((task, index) => {
    console.log(`\n${index + 1}. ${task.title}`);
    console.log(`   Mentee: ${task.mentee.name}`);
    console.log(`   Status: ${task.status}`);
    console.log(`   Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
