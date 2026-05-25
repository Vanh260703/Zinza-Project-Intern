import type { Gender, Role } from "@/enums/auth";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  password: string;
  gender: Gender;
  role: Role;
  candy: number;
  chaptersRead: number;
joinedAt?: string;
  isRead: string[];
  storiesMark: string[];
  unlockedChapters: string[];
  monthlyRecommendationTicket: number;
}

