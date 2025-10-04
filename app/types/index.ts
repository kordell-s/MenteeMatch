export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'MENTOR' | 'MENTEE';
  profilePicture?: string;
  bio: string;
  skills: string[];
  location?: string;
  company?: string;
  title?: string;
  experienceLevel: string;
}

export interface MentorshipRequestWithMentee {
  id: string;
  menteeId: string;
  offeringType: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  mentee: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    skills: string[];
    experienceLevel: string;
  };
}
