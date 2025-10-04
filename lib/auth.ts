import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

declare module "next-auth" {
  interface User {
    role: string;
    profilePicture?: string;
    profileComplete?: boolean;
  }
  
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      profilePicture?: string;
      profileComplete?: boolean;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    profilePicture?: string;
    profileComplete?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        try {
          console.log("🔍 Looking for user:", credentials.email);
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            console.log("❌ User not found:", credentials.email);
            return null;
          }

          if (user.password !== credentials.password) {
            console.log("❌ Password mismatch for user:", credentials.email);
            return null;
          }

          console.log("✅ User authenticated successfully:", {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            profilePicture: user.profilePicture || undefined,
            profileComplete: user.profileComplete || false,
          };
        } catch (error) {
          console.error("❌ Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in - this is where the problem usually is
      if (user) {
        console.log("🔧 JWT callback - Adding user to token:", user.email);
        token.id = user.id;
        token.role = user.role;
        token.profilePicture = user.profilePicture;
        token.profileComplete = user.profileComplete;
      }
      
      console.log("🔧 JWT token:", {
        id: token.id,
        email: token.email,
        role: token.role,
        sub: token.sub
      });
      
      return token;
    },
    async session({ session, token }) {
      console.log("🔧 Session callback - Building session from token");
      
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.profilePicture = token.profilePicture as string;
        session.user.profileComplete = token.profileComplete as boolean;
        
        console.log("✅ Session built successfully:", {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role
        });
      } else {
        console.error("❌ Session callback failed - missing token or session.user");
      }
      
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  debug: process.env.NODE_ENV === "development",
};