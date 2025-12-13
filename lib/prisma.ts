import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Ensure DATABASE_URL is set, or provide a fallback for local development
const dbUrl = process.env.DATABASE_URL || "file:./dev.db";

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
