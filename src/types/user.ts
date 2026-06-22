import type { Gender, Role } from "@/enums/auth";
import type { Story } from "@/types/story";
import type { Chapter } from "@/types/chapter";

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
  recommendationTicket: number;
  dailyReadCount?: number;
  dailyReadDate?: string;
  dailyReadChapterIds?: Record<Story["id"], Record<Chapter["id"], true>>;
  dailyTicketClaimed?: boolean;
  lastReadChapters?: Record<Story["id"], Pick<Chapter, "id" | "title" | "number">>;
}

// Số dư kẹo — tách khỏi User vì nằm trong bảng user_wallets
export interface UserWallet {
  userId: string;
  balance: number;
}
