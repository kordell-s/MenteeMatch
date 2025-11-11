-- Manual schema sync migration
-- This migration documents the manual changes made to align the database with the Prisma schema

-- CreateEnum (already exists in database)
DO $$ BEGIN
 CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "TimeSlot" AS ENUM ('EARLY_MORNING', 'MORNING', 'AFTERNOON', 'EVENING', 'LATE_EVENING');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "Specialization" AS ENUM ('FRONTEND_DEVELOPMENT','BACKEND_DEVELOPMENT','FULLSTACK_DEVELOPMENT','MOBILE_DEVELOPMENT','WEB_DEVELOPMENT','SOFTWARE_ENGINEERING','SYSTEM_ARCHITECTURE','DATABASE_DESIGN','DEVOPS_ENGINEERING','CLOUD_COMPUTING','INFRASTRUCTURE_MANAGEMENT','DEPLOYMENT_AUTOMATION','SYSTEM_ADMINISTRATION','DATA_ENGINEERING','DATA_ANALYSIS','MACHINE_LEARNING_ENGINEERING','AI_DEVELOPMENT','BIG_DATA_PROCESSING','BUSINESS_INTELLIGENCE','UI_UX_DESIGN','PRODUCT_DESIGN','GRAPHIC_DESIGN','USER_RESEARCH','DESIGN_SYSTEMS','ACCESSIBILITY_DESIGN','PRODUCT_MANAGEMENT','PROJECT_MANAGEMENT','BUSINESS_ANALYSIS','STRATEGIC_PLANNING','STARTUP_CONSULTING','DIGITAL_TRANSFORMATION','DIGITAL_MARKETING','CONTENT_MARKETING','GROWTH_MARKETING','SOCIAL_MEDIA_STRATEGY','BRAND_MANAGEMENT','SEO_OPTIMIZATION','CAREER_COACHING','TECHNICAL_INTERVIEWING','RESUME_OPTIMIZATION','LEADERSHIP_DEVELOPMENT','TEAM_BUILDING','PUBLIC_SPEAKING','NETWORKING_STRATEGY','FINTECH_DEVELOPMENT','HEALTHCARE_TECH','E_COMMERCE_DEVELOPMENT','GAMING_DEVELOPMENT','BLOCKCHAIN_DEVELOPMENT','CYBERSECURITY','FREELANCING_GUIDANCE','REMOTE_WORK_CONSULTING','TECHNICAL_WRITING','API_DEVELOPMENT','QUALITY_ASSURANCE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "MentorshipRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "SessionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- AlterTable User (add missing columns if they don't exist)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gender" "Gender";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "timeAvailability" "TimeSlot"[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileComplete" BOOLEAN DEFAULT false;

-- AlterTable User (convert availability column type)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'availability' AND data_type = 'text') THEN
    ALTER TABLE "User" ALTER COLUMN "availability" TYPE "DayOfWeek"[] USING
      CASE WHEN "availability" IS NULL THEN NULL ELSE string_to_array("availability", ',')::"DayOfWeek"[] END;
  END IF;
END $$;

-- AlterTable Mentor (convert specialization column type)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Mentor' AND column_name = 'specialization' AND udt_name != '_Specialization') THEN
    ALTER TABLE "Mentor" ALTER COLUMN "specialization" TYPE "Specialization"[] USING "specialization"::text[]::"Specialization"[];
  END IF;
END $$;

-- AlterTable Mentee
ALTER TABLE "Mentee" ADD COLUMN IF NOT EXISTS "detailedGoals" TEXT;

-- AlterTable Mentorship
ALTER TABLE "Mentorship" ADD COLUMN IF NOT EXISTS "status" "MentorshipRequestStatus" DEFAULT 'PENDING';

-- AlterTable Session
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "offeringType" TEXT;

-- AlterTable Session (convert status column type)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Session' AND column_name = 'status' AND data_type = 'text') THEN
    ALTER TABLE "Session" ALTER COLUMN "status" TYPE "SessionStatus" USING "status"::"SessionStatus";
  END IF;
END $$;

-- AlterTable Rating
ALTER TABLE "Rating" ADD COLUMN IF NOT EXISTS "sessionId" TEXT;
ALTER TABLE "Rating" ADD COLUMN IF NOT EXISTS "feedback" TEXT;
