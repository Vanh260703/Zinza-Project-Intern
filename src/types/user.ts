import type { Gender, Role } from "@/enums/auth";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  password: string;
  gender: Gender;
  role: Role;
  chaptersRead: number;
  joinedAt?: string;
  monthlyRecommendationTicket: number;
  // isRead     → LibraryStore / user_story_reads table
  // storiesMark   → LibraryStore / user_story_bookmarks table
  // unlockedChapters → chapter_purchases table
}

// Số dư kẹo — tách khỏi User vì nằm trong bảng user_wallets
export interface UserWallet {
  userId: string;
  balance: number;
}
