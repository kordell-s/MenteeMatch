import { POST } from "@/app/api/messages/send/route";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Mock dependencies
jest.mock("@/lib/auth-helpers");
jest.mock("@/lib/prisma", () => ({
  prisma: {
    conversation: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    message: {
      create: jest.fn(),
    },
  },
}));

describe("POST /api/messages/send", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCurrentUser = {
    id: "user-1",
    email: "user1@test.com",
    name: "User 1",
    role: "MENTEE",
  };

  const mockConversation = {
    id: "conversation-1",
    mentorId: "mentor-1",
    menteeId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createMockRequest = (body: any) => {
    return {
      json: async () => body,
    } as NextRequest;
  };

  describe("Authentication", () => {
    it("should return 401 if user is not authenticated", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        conversationId: "conversation-1",
        content: "Hello",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("Validation", () => {
    beforeEach(() => {
      (getCurrentUser as jest.Mock).mockResolvedValue(mockCurrentUser);
    });

    it("should return 400 if conversationId is missing", async () => {
      const request = createMockRequest({
        content: "Hello",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Conversation ID and content are required");
    });

    it("should return 400 if content is missing", async () => {
      const request = createMockRequest({
        conversationId: "conversation-1",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Conversation ID and content are required");
    });

    it("should return 400 if content is empty after trimming", async () => {
      const request = createMockRequest({
        conversationId: "conversation-1",
        content: "   ",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Conversation ID and content are required");
    });
  });

  describe("Authorization", () => {
    beforeEach(() => {
      (getCurrentUser as jest.Mock).mockResolvedValue(mockCurrentUser);
    });

    it("should return 404 if conversation does not exist", async () => {
      (prisma.conversation.findFirst as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        conversationId: "non-existent",
        content: "Hello",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Conversation not found or access denied");
    });

    it("should return 404 if user is not part of the conversation", async () => {
      const differentConversation = {
        ...mockConversation,
        mentorId: "other-mentor",
        menteeId: "other-mentee",
      };

      (prisma.conversation.findFirst as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        conversationId: "conversation-1",
        content: "Hello",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Conversation not found or access denied");
    });

    it("should allow mentee to send message in their conversation", async () => {
      (prisma.conversation.findFirst as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.message.create as jest.Mock).mockResolvedValue({
        id: "message-1",
        content: "Hello",
        senderId: "user-1",
        receiverId: "mentor-1",
        conversationId: "conversation-1",
        timestamp: new Date(),
        sender: {
          id: "user-1",
          name: "User 1",
        },
      });
      (prisma.conversation.update as jest.Mock).mockResolvedValue(mockConversation);

      const request = createMockRequest({
        conversationId: "conversation-1",
        content: "Hello",
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("should allow mentor to send message in their conversation", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({
        id: "mentor-1",
        email: "mentor@test.com",
        name: "Mentor",
        role: "MENTOR",
      });

      (prisma.conversation.findFirst as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.message.create as jest.Mock).mockResolvedValue({
        id: "message-1",
        content: "Hello",
        senderId: "mentor-1",
        receiverId: "user-1",
        conversationId: "conversation-1",
        timestamp: new Date(),
        sender: {
          id: "mentor-1",
          name: "Mentor",
        },
      });
      (prisma.conversation.update as jest.Mock).mockResolvedValue(mockConversation);

      const request = createMockRequest({
        conversationId: "conversation-1",
        content: "Hello from mentor",
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe("Message Creation", () => {
    beforeEach(() => {
      (getCurrentUser as jest.Mock).mockResolvedValue(mockCurrentUser);
      (prisma.conversation.findFirst as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.conversation.update as jest.Mock).mockResolvedValue(mockConversation);
    });

    it("should create message with correct data", async () => {
      const mockMessage = {
        id: "message-1",
        content: "Hello",
        senderId: "user-1",
        receiverId: "mentor-1",
        conversationId: "conversation-1",
        timestamp: new Date(),
        sender: {
          id: "user-1",
          name: "User 1",
        },
      };

      (prisma.message.create as jest.Mock).mockResolvedValue(mockMessage);

      const request = createMockRequest({
        conversationId: "conversation-1",
        content: "Hello",
      });

      await POST(request);

      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          content: "Hello",
          senderId: "user-1",
          receiverId: "mentor-1",
          conversationId: "conversation-1",
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it("should trim message content", async () => {
      (prisma.message.create as jest.Mock).mockResolvedValue({
        id: "message-1",
        content: "Hello",
        senderId: "user-1",
        receiverId: "mentor-1",
        conversationId: "conversation-1",
        timestamp: new Date(),
        sender: {
          id: "user-1",
          name: "User 1",
        },
      });

      const request = createMockRequest({
        conversationId: "conversation-1",
        content: "  Hello  ",
      });

      await POST(request);

      expect(prisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: "Hello",
          }),
        })
      );
    });

    it("should determine correct receiver when sender is mentee", async () => {
      (prisma.message.create as jest.Mock).mockResolvedValue({
        id: "message-1",
        content: "Hello",
        senderId: "user-1",
        receiverId: "mentor-1",
        conversationId: "conversation-1",
        timestamp: new Date(),
        sender: {
          id: "user-1",
          name: "User 1",
        },
      });

      const request = createMockRequest({
        conversationId: "conversation-1",
        content: "Hello",
      });

      await POST(request);

      expect(prisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            receiverId: "mentor-1",
          }),
        })
      );
    });

    it("should determine correct receiver when sender is mentor", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({
        id: "mentor-1",
        email: "mentor@test.com",
        name: "Mentor",
        role: "MENTOR",
      });

      (prisma.message.create as jest.Mock).mockResolvedValue({
        id: "message-1",
        content: "Hello",
        senderId: "mentor-1",
        receiverId: "user-1",
        conversationId: "conversation-1",
        timestamp: new Date(),
        sender: {
          id: "mentor-1",
          name: "Mentor",
        },
      });

      const request = createMockRequest({
        conversationId: "conversation-1",
        content: "Hello from mentor",
      });

      await POST(request);

      expect(prisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            receiverId: "user-1",
          }),
        })
      );
    });

    it("should update conversation timestamp", async () => {
      (prisma.message.create as jest.Mock).mockResolvedValue({
        id: "message-1",
        content: "Hello",
        senderId: "user-1",
        receiverId: "mentor-1",
        conversationId: "conversation-1",
        timestamp: new Date(),
        sender: {
          id: "user-1",
          name: "User 1",
        },
      });

      const request = createMockRequest({
        conversationId: "conversation-1",
        content: "Hello",
      });

      await POST(request);

      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: "conversation-1" },
        data: { updatedAt: expect.any(Date) },
      });
    });

    it("should return created message with sender info", async () => {
      const mockMessage = {
        id: "message-1",
        content: "Hello",
        senderId: "user-1",
        receiverId: "mentor-1",
        conversationId: "conversation-1",
        timestamp: new Date(),
        sender: {
          id: "user-1",
          name: "User 1",
        },
      };

      (prisma.message.create as jest.Mock).mockResolvedValue(mockMessage);

      const request = createMockRequest({
        conversationId: "conversation-1",
        content: "Hello",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(mockMessage.id);
      expect(data.content).toBe(mockMessage.content);
      expect(data.senderId).toBe(mockMessage.senderId);
      expect(data.receiverId).toBe(mockMessage.receiverId);
      expect(data.sender).toEqual(mockMessage.sender);
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      (getCurrentUser as jest.Mock).mockResolvedValue(mockCurrentUser);
      (prisma.conversation.findFirst as jest.Mock).mockResolvedValue(mockConversation);
    });

    it("should handle database errors when creating message", async () => {
      (prisma.message.create as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const request = createMockRequest({
        conversationId: "conversation-1",
        content: "Hello",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to send message");
    });

    it("should handle database errors when updating conversation", async () => {
      (prisma.message.create as jest.Mock).mockResolvedValue({
        id: "message-1",
        content: "Hello",
        senderId: "user-1",
        receiverId: "mentor-1",
        conversationId: "conversation-1",
        timestamp: new Date(),
        sender: {
          id: "user-1",
          name: "User 1",
        },
      });

      (prisma.conversation.update as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const request = createMockRequest({
        conversationId: "conversation-1",
        content: "Hello",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to send message");
    });
  });
});
