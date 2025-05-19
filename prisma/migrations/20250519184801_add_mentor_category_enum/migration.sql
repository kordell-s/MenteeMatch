-- CreateEnum
CREATE TYPE "MentorCategory" AS ENUM ('TECHNOLOGY', 'BUSINESS', 'DESIGN', 'MARKETING', 'CREATIVE', 'HEALTH', 'MUSIC', 'OTHER');

-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "category" "MentorCategory" NOT NULL DEFAULT 'OTHER';
