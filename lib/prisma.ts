import {PrismaClient} from '@prisma/client';

const globalForPrisma = globalThis as unknown as { 
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
// This code initializes a Prisma Client instance and ensures that it is reused in development mode to prevent exhausting database connections.