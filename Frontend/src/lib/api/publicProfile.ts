import { normalizeNovel, type BeNovel } from "@/lib/normalizeNovel";
import type { Novel } from "@/types/novel";
import type { Role } from "@/enums/auth";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Chỉ các field trang hồ sơ công khai cần (BE không trả email/ví).
export type PublicUser = {
  id: string;
  name: string;
  role: Role;
  chaptersRead: number;
  joinedAt?: string;
};

type BePublicUser = {
  id: string;
  name: string;
  role: string; // 'USER' | 'ADMIN'
  chaptersRead: number;
  joinedAt?: string;
};

// Hồ sơ công khai của 1 user + danh sách truyện họ đã đăng (server component).
export async function getPublicProfile(
  id: string
): Promise<{ user: PublicUser; novels: Novel[] } | null> {
  const userRes = await fetch(`${BE_URL}/api/v1/users/${id}`, { cache: "no-store" });
  if (!userRes.ok) return null; // 404 (không tồn tại) hoặc 400 (id không phải UUID)
  const u = (await userRes.json()) as BePublicUser;

  // Truyện đã đăng — lọc theo postedBy (id đã hợp lệ vì user tồn tại)
  const novelsRes = await fetch(`${BE_URL}/api/v1/novels?postedBy=${id}&limit=100`, {
    cache: "no-store",
  });
  const novels: Novel[] = novelsRes.ok
    ? (((await novelsRes.json()).data ?? []) as BeNovel[]).map(normalizeNovel)
    : [];

  return {
    user: {
      id: u.id,
      name: u.name,
      role: u.role === "ADMIN" ? "admin" : "user",
      chaptersRead: u.chaptersRead,
      joinedAt: u.joinedAt,
    },
    novels,
  };
}
