export interface DashboardData {
  mentorInfo: {
    id: string;
    name: string;
    profilePicture: string | null;
    bio: string | null;
    rating: number | null;
    availability: string | null;
    skills: string[]; 
    company: string | null;
  };
  upcomingSessions: {
    id: string;
    date: string;
    time: string;
    duration: number;
    status: string;
    feedback: string | null;
    rating: number | null;
    mentee: {
      id: string;
      name: string;
      profilePicture: string | null;
    };
  }[];
  completedSessionsCount: number;
  mentorshipRequests: {
    id: string;
    menteeId: string;
    mentorId: string;
    status: string;
    date: string;
    time: string;
    mentee: {
      id: string;
      name: string;
      profilePicture: string | null;
    };
  }[];
  confirmedMentees: {
    id: string;
    name: string;
    profilePicture: string | null;
    bio: string | null;
    goals: string[];
    status: "active" | "inactive";
    sessionsCompleted: number;
    joinedDate: string | null;
    lastSession: string | null;
    nextSession: string | null;
  }[];
  totalMentees: number;
}
