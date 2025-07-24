import { ExperienceLevel } from "@prisma/client";


export type MentorCategory =
  | "TECHNOLOGY"
  | "BUSINESS"
  | "DESIGN"
  | "MARKETING"
  | "CREATIVE"
  | "HEALTH"
  | "MUSIC"
  | "OTHER";

export type Mentor = {
  id: string;
  name: string;
  title?: string;
  email: string;
  profilePicture?: string;
  availability?: string;
  location?: string;
  rating?: number;
  skills: string[];
  experience: string[];
  languages: string[];
  school?: string;
  company?: string;
  experienceLevel?: ExperienceLevel;
  bio?: string;
  createdAt?: Date;
  role: "MENTOR";
  verified?: boolean;
  category: MentorCategory; 
  mentor: {
    specialization: string[];
    pricing: number | null;
  };
};
