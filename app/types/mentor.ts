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
  email: string;
  profilePicture?: string;
  availability?: string;
  location?: string;
  rating?: number;
  skills: string[];
  experience: string[];
  languages: string[];
  company?: string;
  bio?: string;
  role: "MENTOR";
  category: MentorCategory; 
  mentor: {
    specialization: string[];
    pricing: number | null;
  };
};
