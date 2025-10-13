import { POST } from "@/app/api/match/route";
import { prisma } from "@/lib/prisma";
import { getMentorRecommendations } from "@/lib/matching";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

// Mock matching algorithm
jest.mock("@/lib/matching", () => ({
  getMentorRecommendations: jest.fn(),
}));

describe("POST /api/match", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (body: any) => {
    return {
      json: async () => body,
    } as NextRequest;
  };

  const mockMentee = {
    id: "mentee-1",
    name: "Alex Mentee",
    role: "MENTEE",
    skills: ["REACT", "NODE_JS", "TYPESCRIPT"],
    bio: "I want to learn full-stack development",
    experienceLevel: "ENTRY",
    profilePicture: null,
    mentee: {
      goals: ["LEARN_CODING", "BUILD_PROJECTS", "CAREER_GUIDANCE"],
    },
  };

  const mockMentors = [
    {
      id: "mentor-1",
      name: "Sarah Johnson",
      email: "sarah@test.com",
      skills: ["REACT", "NODE_JS", "TYPESCRIPT", "SYSTEM_DESIGN"],
      bio: "Senior Full-Stack Developer with 8 years of experience",
      title: "Senior Software Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      rating: 4.8,
      languages: ["English", "Spanish"],
      profilePicture: null,
      experienceLevel: "SENIOR",
      availability: ["MONDAY", "WEDNESDAY", "FRIDAY"],
      timeAvailability: ["EVENING"],
      mentor: {
        pricing: 75,
        category: "TECHNOLOGY",
        specialization: ["FULLSTACK_DEVELOPMENT", "FRONTEND_DEVELOPMENT"],
      },
    },
    {
      id: "mentor-2",
      name: "David Chen",
      email: "david@test.com",
      skills: ["PYTHON", "MACHINE_LEARNING", "DATA_SCIENCE"],
      bio: "Data Science expert",
      title: "Lead Data Scientist",
      company: "DataCorp",
      location: "Seattle, WA",
      rating: 4.9,
      languages: ["English"],
      profilePicture: null,
      experienceLevel: "LEAD",
      availability: ["TUESDAY", "THURSDAY"],
      timeAvailability: ["MORNING"],
      mentor: {
        pricing: 100,
        category: "TECHNOLOGY",
        specialization: ["MACHINE_LEARNING_ENGINEERING"],
      },
    },
  ];

  describe("Validation", () => {
    it("should return empty array if menteeId is missing", async () => {
      const request = createMockRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("should return 404 if mentee not found", async () => {
      const request = createMockRequest({ menteeId: "non-existent" });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Mentee not found");
    });

    it("should return 404 if user is not a mentee", async () => {
      const request = createMockRequest({ menteeId: "mentor-id" });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockMentee,
        role: "MENTOR",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Mentee not found");
    });

    it("should return empty array if mentee has no skills", async () => {
      const request = createMockRequest({ menteeId: "mentee-1" });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockMentee,
        skills: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("should return empty array if no mentors exist", async () => {
      const request = createMockRequest({ menteeId: "mentee-1" });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockMentee);
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  describe("Matching Algorithm", () => {
    it("should successfully match mentee with mentors", async () => {
      const request = createMockRequest({ menteeId: "mentee-1" });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockMentee);
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockMentors);
      (getMentorRecommendations as jest.Mock).mockResolvedValue([
        {
          id: "mentor-1",
          name: "Sarah Johnson",
          email: "sarah@test.com",
          bio: "Senior Full-Stack Developer with 8 years of experience",
          skills: ["REACT", "NODE_JS", "TYPESCRIPT", "SYSTEM_DESIGN"],
          title: "Senior Software Engineer",
          company: "Tech Corp",
          location: "San Francisco, CA",
          rating: 4.8,
          languages: ["English", "Spanish"],
          profilePicture: null,
          pricing: 75,
          category: "TECHNOLOGY",
          specialization: ["FULLSTACK_DEVELOPMENT", "FRONTEND_DEVELOPMENT"],
          experienceLevel: "SENIOR",
          availability: ["MONDAY", "WEDNESDAY", "FRIDAY"],
          timeAvailability: ["EVENING"],
          score: 0.95,
        },
        {
          id: "mentor-2",
          name: "David Chen",
          email: "david@test.com",
          bio: "Data Science expert",
          skills: ["PYTHON", "MACHINE_LEARNING", "DATA_SCIENCE"],
          title: "Lead Data Scientist",
          company: "DataCorp",
          location: "Seattle, WA",
          rating: 4.9,
          languages: ["English"],
          profilePicture: null,
          pricing: 100,
          category: "TECHNOLOGY",
          specialization: ["MACHINE_LEARNING_ENGINEERING"],
          experienceLevel: "LEAD",
          availability: ["TUESDAY", "THURSDAY"],
          timeAvailability: ["MORNING"],
          score: 0.65,
        },
      ]);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.algorithm).toBe("TF-IDF + Word Embeddings");
      expect(data.matches).toHaveLength(2);
      expect(data.matches[0].mentorId).toBe("mentor-1");
      expect(data.matches[0].score).toBe(0.95);
      expect(data.matches[1].mentorId).toBe("mentor-2");
      expect(data.matches[1].score).toBe(0.65);
    });

    it("should call matching algorithm with correct mentee text", async () => {
      const request = createMockRequest({ menteeId: "mentee-1" });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockMentee);
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockMentors);
      (getMentorRecommendations as jest.Mock).mockResolvedValue([]);

      await POST(request);

      expect(getMentorRecommendations).toHaveBeenCalledWith(
        expect.stringContaining("REACT"),
        expect.any(Array)
      );

      const menteeText = (getMentorRecommendations as jest.Mock).mock.calls[0][0];
      expect(menteeText).toContain("REACT");
      expect(menteeText).toContain("NODE_JS");
      expect(menteeText).toContain("LEARN_CODING");
      expect(menteeText).toContain("I want to learn full-stack development");
    });

    it("should format mentors correctly for algorithm", async () => {
      const request = createMockRequest({ menteeId: "mentee-1" });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockMentee);
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockMentors);
      (getMentorRecommendations as jest.Mock).mockResolvedValue([]);

      await POST(request);

      const formattedMentors = (getMentorRecommendations as jest.Mock).mock.calls[0][1];
      expect(formattedMentors).toHaveLength(2);
      expect(formattedMentors[0]).toHaveProperty("id");
      expect(formattedMentors[0]).toHaveProperty("skills");
      expect(formattedMentors[0]).toHaveProperty("bio");
      expect(formattedMentors[0]).toHaveProperty("specialization");
    });

    it("should include mentor rankings in response", async () => {
      const request = createMockRequest({ menteeId: "mentee-1" });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockMentee);
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockMentors);
      (getMentorRecommendations as jest.Mock).mockResolvedValue([
        { ...mockMentors[0], score: 0.95 },
        { ...mockMentors[1], score: 0.65 },
      ]);

      const response = await POST(request);
      const data = await response.json();

      expect(data.matches[0].rank).toBe(1);
      expect(data.matches[1].rank).toBe(2);
    });

    it("should include mentee profile in response", async () => {
      const request = createMockRequest({ menteeId: "mentee-1" });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockMentee);
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockMentors);
      (getMentorRecommendations as jest.Mock).mockResolvedValue([]);

      const response = await POST(request);
      const data = await response.json();

      expect(data.menteeProfile).toEqual({
        name: mockMentee.name,
        skills: mockMentee.skills,
        goals: mockMentee.mentee.goals,
        experienceLevel: mockMentee.experienceLevel,
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      const request = createMockRequest({ menteeId: "mentee-1" });

      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.matches).toEqual([]);
      expect(data.error).toBe("Smart matching failed");
    });

    it("should handle matching algorithm errors", async () => {
      const request = createMockRequest({ menteeId: "mentee-1" });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockMentee);
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockMentors);
      (getMentorRecommendations as jest.Mock).mockRejectedValue(
        new Error("Algorithm error")
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.matches).toEqual([]);
    });

    it("should handle mentors without mentor profile", async () => {
      const request = createMockRequest({ menteeId: "mentee-1" });

      const mentorsWithoutProfile = [
        {
          ...mockMentors[0],
          mentor: null,
        },
      ];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockMentee);
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mentorsWithoutProfile);
      (getMentorRecommendations as jest.Mock).mockResolvedValue([]);

      const response = await POST(request);

      // Should not throw error
      expect(response.status).toBe(200);
    });
  });

  describe("Data Completeness", () => {
    it("should handle mentee with missing optional fields", async () => {
      const request = createMockRequest({ menteeId: "mentee-1" });

      const incompleteMentee = {
        ...mockMentee,
        bio: null,
        experienceLevel: null,
        mentee: {
          goals: [],
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(incompleteMentee);
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockMentors);
      (getMentorRecommendations as jest.Mock).mockResolvedValue([]);

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(getMentorRecommendations).toHaveBeenCalled();
    });

    it("should handle mentors with missing optional fields", async () => {
      const request = createMockRequest({ menteeId: "mentee-1" });

      const incompleteMentors = [
        {
          ...mockMentors[0],
          bio: null,
          title: null,
          company: null,
          location: null,
          rating: null,
          languages: null,
          availability: null,
          timeAvailability: null,
        },
      ];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockMentee);
      (prisma.user.findMany as jest.Mock).mockResolvedValue(incompleteMentors);
      (getMentorRecommendations as jest.Mock).mockResolvedValue([
        { ...incompleteMentors[0], score: 0.8 },
      ]);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.matches[0].mentorData.bio).toBe("");
      expect(data.matches[0].mentorData.title).toBeNull();
    });
  });
});
