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
    mentor: {
      specialization: string[];
      pricing: number | null;
    };
  };
  
