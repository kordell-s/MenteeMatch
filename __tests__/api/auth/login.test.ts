import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock("bcryptjs");

describe("Authentication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("CredentialsProvider authorize", () => {
    // Access the authorize function from the credentials provider
    const authorize = (authOptions.providers[0] as any).authorize;

    it("should return null if email is missing", async () => {
      const result = await authorize({
        password: "Test123!",
      });

      expect(result).toBeNull();
    });

    it("should return null if password is missing", async () => {
      const result = await authorize({
        email: "test@test.com",
      });

      expect(result).toBeNull();
    });

    it("should return null if user does not exist", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await authorize({
        email: "nonexistent@test.com",
        password: "Test123!",
      });

      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalled();
    });

    it("should return null if password is incorrect", async () => {
      const mockUser = {
        id: "user-id",
        email: "test@test.com",
        name: "Test User",
        password: "hashed-password",
        role: "MENTEE",
        profilePicture: null,
        profileComplete: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authorize({
        email: "test@test.com",
        password: "WrongPassword123!",
      });

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalled();
    });

    it("should return user object if credentials are valid", async () => {
      const mockUser = {
        id: "user-id",
        email: "test@test.com",
        name: "Test User",
        password: "hashed-password",
        role: "MENTEE",
        profilePicture: "profile.jpg",
        profileComplete: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authorize({
        email: "test@test.com",
        password: "Test123!",
      });

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        profilePicture: mockUser.profilePicture,
        profileComplete: mockUser.profileComplete,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith("Test123!", "hashed-password");
    });

    it("should handle users without profile picture", async () => {
      const mockUser = {
        id: "user-id",
        email: "test@test.com",
        name: "Test User",
        password: "hashed-password",
        role: "MENTOR",
        profilePicture: null,
        profileComplete: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authorize({
        email: "test@test.com",
        password: "Test123!",
      });

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        profilePicture: undefined,
        profileComplete: false,
      });
    });

    it("should return null on database errors", async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await authorize({
        email: "test@test.com",
        password: "Test123!",
      });

      expect(result).toBeNull();
    });

    it("should use bcrypt.compare for password validation (security)", async () => {
      const mockUser = {
        id: "user-id",
        email: "test@test.com",
        name: "Test User",
        password: "hashed-password",
        role: "MENTEE",
        profilePicture: null,
        profileComplete: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Test with correct password
      const correctResult = await authorize({
        email: "test@test.com",
        password: "Test123!",
      });
      expect(correctResult).not.toBeNull();
      expect(bcrypt.compare).toHaveBeenCalled();

      // Test with incorrect password
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const incorrectResult = await authorize({
        email: "test@test.com",
        password: "WrongPassword",
      });
      expect(incorrectResult).toBeNull();
    });
  });

  describe("JWT Callback", () => {
    const jwtCallback = authOptions.callbacks?.jwt;

    it("should add user data to token on initial sign in", async () => {
      const token = {
        email: "test@test.com",
      };

      const user = {
        id: "user-id",
        email: "test@test.com",
        name: "Test User",
        role: "MENTEE",
        profilePicture: "profile.jpg",
        profileComplete: true,
      };

      const result = await jwtCallback!({ token, user } as any);

      expect(result).toEqual({
        email: "test@test.com",
        id: "user-id",
        role: "MENTEE",
        profilePicture: "profile.jpg",
        profileComplete: true,
      });
    });

    it("should return token unchanged if no user provided", async () => {
      const token = {
        email: "test@test.com",
        id: "user-id",
        role: "MENTOR",
      };

      const result = await jwtCallback!({ token, user: undefined } as any);

      expect(result).toEqual(token);
    });
  });

  describe("Session Callback", () => {
    const sessionCallback = authOptions.callbacks?.session;

    it("should build session from token", async () => {
      const session = {
        user: {
          email: "test@test.com",
          name: "Test User",
        },
        expires: "2025-12-31",
      };

      const token = {
        id: "user-id",
        email: "test@test.com",
        role: "MENTEE",
        profilePicture: "profile.jpg",
        profileComplete: true,
      };

      const result = await sessionCallback!({ session, token } as any);

      expect(result.user).toEqual({
        email: "test@test.com",
        name: "Test User",
        id: "user-id",
        role: "MENTEE",
        profilePicture: "profile.jpg",
        profileComplete: true,
      });
    });

    it("should handle missing profile data", async () => {
      const session = {
        user: {
          email: "test@test.com",
          name: "Test User",
        },
        expires: "2025-12-31",
      };

      const token = {
        id: "user-id",
        email: "test@test.com",
        role: "MENTOR",
      };

      const result = await sessionCallback!({ session, token } as any);

      expect(result.user?.profilePicture).toBeUndefined();
      expect(result.user?.profileComplete).toBeUndefined();
    });
  });

  describe("Auth Configuration", () => {
    it("should use JWT strategy", () => {
      expect(authOptions.session?.strategy).toBe("jwt");
    });

    it("should have correct session duration", () => {
      expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60); // 30 days
    });

    it("should have correct update age", () => {
      expect(authOptions.session?.updateAge).toBe(24 * 60 * 60); // 24 hours
    });

    it("should have custom sign in page", () => {
      expect(authOptions.pages?.signIn).toBe("/login");
    });

    it("should have custom error page", () => {
      expect(authOptions.pages?.error).toBe("/login");
    });

    it("should use secure cookies in production", () => {
      const cookieOptions = authOptions.cookies?.sessionToken?.options;
      expect(cookieOptions?.httpOnly).toBe(true);
      expect(cookieOptions?.sameSite).toBe("lax");
    });
  });
});
