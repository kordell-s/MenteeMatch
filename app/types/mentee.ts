export type Mentee = {
    id: string;
    name: string;
    profilePicture: string;
    bio: string;
    company?: string;
    status?: "active" | "inactive";
    progress?: number;
    sessionsCompleted?: number;
    lastSessionDate?: string;
    nextSessionDate?: string;
    mentee?:{
        goals: string | null;
    } | null;
};