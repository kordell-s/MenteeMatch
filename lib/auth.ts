import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
// import bcrypt from 'bcryptjs'; // Comment out for now

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          console.log('Attempting to authenticate user:', credentials.email);
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }

          console.log('User found:', {
            id: user.id,
            email: user.email,
            name: user.name,
            hasPassword: !!user.password,
          });

          // TEMPORARY: Plain text password comparison for testing
          console.log('Checking password (plain text)...');
          console.log('Input password:', credentials.password);
          console.log('Stored password:', user.password);
          
          const isPasswordValid = user.password === credentials.password;

          console.log('Password comparison result:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          console.log('Authentication successful for user:', credentials.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            profilePicture: user.profilePicture || undefined,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.profilePicture = user.profilePicture;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.profilePicture = token.profilePicture as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/' // Redirect to home page after logout
  },
  debug: process.env.NODE_ENV === 'development',
};