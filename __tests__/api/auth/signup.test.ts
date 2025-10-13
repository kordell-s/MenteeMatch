import { POST } from "@/app/api/auth/signup/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock("bcryptjs");

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validSignupData = {
    name: "John Doe",
    email: "john@test.com",
    password: "Test123!",
    role: "MENTEE",
    bio: "I'm a test user",
    title: "Developer",
    school: "Test University",
  };

  const createMockRequest = (body: any) => {
    return {
      json: async () => body,
    } as NextRequest;
  };

  describe("Validation", () => {
    it("should reject signup with missing required fields", async () => {
      const request = createMockRequest({
        name: "John",
        // missing email, password, role
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Missing required fields");
    });

    it("should reject signup with invalid email format", async () => {
      const request = createMockRequest({
        ...validSignupData,
        email: "invalid-email",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid email format");
    });

    it("should reject signup with short password", async () => {
      const request = createMockRequest({
        ...validSignupData,
        password: "Test1",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Password must be at least 8 characters long");
    });

    it("should reject signup with password missing uppercase", async () => {
      const request = createMockRequest({
        ...validSignupData,
        password: "test123!",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("uppercase");
    });

    it("should reject signup with password missing lowercase", async () => {
      const request = createMockRequest({
        ...validSignupData,
        password: "TEST123!",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("lowercase");
    });

    it("should reject signup with password missing number", async () => {
      const request = createMockRequest({
        ...validSignupData,
        password: "TestTest!",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("number");
    });

    it("should reject signup with invalid role", async () => {
      const request = createMockRequest({
        ...validSignupData,
        role: "INVALID_ROLE",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid role");
    });
  });

  describe("User Creation", () => {
    it("should reject signup if user already exists", async () => {
      const request = createMockRequest(validSignupData);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "existing-user-id",
        email: validSignupData.email,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe("User with this email already exists");
    });

    it("should successfully create a new mentee user", async () => {
      const request = createMockRequest(validSignupData);

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce({
        id: "new-user-id",
        name: validSignupData.name,
        email: validSignupData.email,
        role: validSignupData.role,
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "new-user-id",
        name: validSignupData.name,
        email: validSignupData.email,
        role: validSignupData.role,
        profileComplete: false,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe(validSignupData.email);
      expect(data.user.role).toBe("MENTEE");
      expect(bcrypt.hash).toHaveBeenCalledWith(validSignupData.password, expect.any(Number));
    });

    it("should successfully create a new mentor user", async () => {
      const mentorData = {
        ...validSignupData,
        role: "MENTOR",
      };

      const request = createMockRequest(mentorData);

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce({
        id: "new-mentor-id",
        name: mentorData.name,
        email: mentorData.email,
        role: mentorData.role,
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "new-mentor-id",
        name: mentorData.name,
        email: mentorData.email,
        role: mentorData.role,
        profileComplete: false,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.user.role).toBe("MENTOR");
    });

    it("should hash password with correct salt rounds in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const request = createMockRequest(validSignupData);

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce({
        id: "new-user-id",
        name: validSignupData.name,
        email: validSignupData.email,
        role: validSignupData.role,
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "new-user-id",
        name: validSignupData.name,
        email: validSignupData.email,
        role: validSignupData.role,
        profileComplete: false,
      });

      await POST(request);

      expect(bcrypt.hash).toHaveBeenCalledWith(validSignupData.password, 10);

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle trimmed bio, title, and school fields", async () => {
      const dataWithWhitespace = {
        ...validSignupData,
        bio: "  Test bio with spaces  ",
        title: "  Developer  ",
        school: "  Test University  ",
      };

      const request = createMockRequest(dataWithWhitespace);

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce({
        id: "new-user-id",
        name: validSignupData.name,
        email: validSignupData.email,
        role: validSignupData.role,
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "new-user-id",
        name: validSignupData.name,
        email: validSignupData.email,
        role: validSignupData.role,
        profileComplete: false,
      });

      await POST(request);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            bio: "Test bio with spaces",
            title: "Developer",
            school: "Test University",
          }),
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      const request = createMockRequest(validSignupData);

      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Internal server error");
    });

    it("should handle bcrypt hashing errors", async () => {
      const request = createMockRequest(validSignupData);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error("Hashing failed"));

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Internal server error");
    });
  });
});
