export interface Card {
  id: number | undefined;
  userImage?: string | null;
  name?: string | null;
  description?: string | null;
  createdById: string | undefined;
  graduationYear?: number | null;
  schoolYear?: string | null;
  school?: string | null;
  major?: string | null;
  createdAt: Date | undefined;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}

export interface PostGridProps {
  posts: Card[];
  schoolId: number | null;
  majorId: number | null;
  graduationYear: number | null;
}

export interface UserProfile {
  bio: string;
  schoolYear: "Freshman" | "Sophomore" | "Junior" | "Senior" | "Graduate";
  graduationYear: number;
  image: string | null;
  userId: string;
  eduEmail: string;
  isMentor: boolean;
  isEduVerified: boolean;
  user: {
    image: string | null;
  };
}

export interface DayAvailability {
  mentorId: string;
  day: string;
  startTime: Date;
  endTime: Date;
}
