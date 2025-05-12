/*
  Warnings:

  - The `goals` column on the `Mentee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `experience` on the `User` table. All the data in the column will be lost.
  - Made the column `bio` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('GET_INTO_TECH', 'TRANSITION_CAREER', 'BUILD_PROJECTS', 'FIND_MENTOR', 'INTERVIEW_PREP', 'RESUME_REVIEW', 'CAREER_GUIDANCE', 'LEARN_CODING', 'PUBLIC_SPEAKING', 'NETWORKING');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('STUDENT', 'ENTRY', 'MID', 'SENIOR', 'LEAD');

-- AlterTable
ALTER TABLE "Mentee" DROP COLUMN "goals",
ADD COLUMN     "goals" "Goal"[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "experience",
ADD COLUMN     "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'ENTRY',
ALTER COLUMN "bio" SET NOT NULL;
