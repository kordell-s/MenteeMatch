import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Use a separate test database or add test-specific logic
export const prisma = new PrismaClient();

export interface TestUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "MENTOR" | "MENTEE";
}

export const TEST_PASSWORD = "Test123!";
export const TEST_PASSWORD_HASHED = bcrypt.hashSync(TEST_PASSWORD, 10);

// Test user credentials
export const TEST_USERS = {
  mentor1: {
    email: "sarah.mentor@test.com",
    password: TEST_PASSWORD,
  },
  mentor2: {
    email: "david.mentor@test.com",
    password: TEST_PASSWORD,
  },
  mentor3: {
    email: "emily.mentor@test.com",
    password: TEST_PASSWORD,
  },
  mentee1: {
    email: "alex.mentee@test.com",
    password: TEST_PASSWORD,
  },
  mentee2: {
    email: "maria.mentee@test.com",
    password: TEST_PASSWORD,
  },
  mentee3: {
    email: "james.mentee@test.com",
    password: TEST_PASSWORD,
  },
};

/**
 * Creates a test user in the database
 */
export async function createTestUser(
  data: Partial<TestUser> & { email: string; role: "MENTOR" | "MENTEE" }
): Promise<TestUser> {
  const hashedPassword = await bcrypt.hash(data.password || TEST_PASSWORD, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name || "Test User",
      email: data.email,
      password: hashedPassword,
      role: data.role,
      bio: "Test bio",
      profileComplete: true,
      verified: true,
    },
  });

  // Create mentor or mentee profile
  if (data.role === "MENTOR") {
    await prisma.mentor.create({
      data: {
        userId: user.id,
        category: "TECHNOLOGY",
      },
    });
  } else {
    await prisma.mentee.create({
      data: {
        userId: user.id,
      },
    });
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: data.password || TEST_PASSWORD,
    role: user.role as "MENTOR" | "MENTEE",
  };
}

/**
 * Cleans up test data from the database
 */
export async function cleanupTestData() {
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.mentorshipRequest.deleteMany({});
  await prisma.mentorship.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.mentor.deleteMany({});
  await prisma.mentee.deleteMany({});
  await prisma.user.deleteMany({});
}

/**
 * Gets a user from the database by email
 */
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      mentor: true,
      mentee: true,
    },
  });
}

/**
 * Creates a mentorship relationship between a mentor and mentee
 */
export async function createTestMentorship(mentorId: string, menteeId: string) {
  return await prisma.mentorship.create({
    data: {
      mentorId,
      menteeId,
      status: "ACCEPTED",
    },
  });
}

/**
 * Creates a conversation between two users
 */
export async function createTestConversation(mentorId: string, menteeId: string) {
  const conversation = await prisma.conversation.create({
    data: {
      mentorId,
      menteeId,
    },
  });

  return conversation;
}

/**
 * Creates a test message
 */
export async function createTestMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string
) {
  return await prisma.message.create({
    data: {
      conversationId,
      senderId,
      receiverId,
      content,
    },
  });
}

/**
 * Waits for a condition to be true
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error("Timeout waiting for condition");
}

/**
 * Mock NextAuth session for testing
 */
export function mockSession(user: { id: string; email: string; role: string }) {
  return {
    user: {
      id: user.id,
      email: user.email,
      name: "Test User",
      role: user.role,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
