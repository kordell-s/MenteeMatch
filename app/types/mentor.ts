export interface Mentor {
    id: string;
    name: string;
    title: string;
    company: string;
    rating: number;
    reviews: number;
    hourlyRate?: number;
    availability?: string;
    image: string;
    tags: string[];
    category?: string;
    bio: string;
    expertise: string[];
}
