import type { Gender, Role } from "@/enums/auth";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  gender: Gender;
  role: Role;
  candy: number;
  chaptersRead: number;
  follower?: number;
  isRead: string[];
  storiesMark: string[];
}

