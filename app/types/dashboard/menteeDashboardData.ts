import { TaskStatus } from "@prisma/client";

export type MentorInfo = {
    id: string;
    name: string;
    title?: string | null;
    profilePicture?: string | null;
    company?: string | null;
    bio?: string | null;
    skills?: string[] | null;
    rating?: number | null;
  };
  
  export type Task = {
    id: string;
    title: string;
    description?: string | null;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    dueDate: string;
  };
  
  export type Session = {
    id: string;
    title: string;
    date: string;
    time: string;
    status: "UPCOMING" | "COMPLETED" | "CANCELLED";
    sessionType: string;
    notes?: string | null;
    mentor: {
      name: string;
      profilePicture?: string | null;
    };
  };
  
  export type MenteeDashboardData = {
    mentorInfo: MentorInfo | null;
    tasks: Task[];
    upcomingSessions: Session[];
    completedSessions: Session[];
    progress: number;
    menteeInfo?: {
      id: string;
      name: string;
      profilePicture?: string;
      title?: string;
      company?: string;
      bio?: string;
      rating?: number;
    };
  };
