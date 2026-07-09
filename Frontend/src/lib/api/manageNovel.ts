import { cookies } from "next/headers";
import { normalizeNovel, type BeNovel } from "@/lib/normalizeNovel";
import type { Novel } from "@/types/novel";
import type { Chapter } from "@/types/chapter";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Chuỗi cookie hiện tại (forward auth từ server component xuống BE)
async function cookieHeader(): Promise<string> {
  const store = await cookies();
  return store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

// Lấy 1 truyện theo slug cho trang quản lý (server component).
export async function getManageNovel(slug: string): Promise<Novel | null> {
  const res = await fetch(`${BE_URL}/api/v1/novels/${slug}`, {
    headers: { Cookie: await cookieHeader() },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return normalizeNovel((await res.json()) as BeNovel);
}

// Lấy 1 chương (kèm nội dung + tên truyện + người đăng) theo slug + chapterId.
// BE trả full content cho owner, và kèm sẵn novel.name/postedBy nên không cần fetch truyện riêng.
export async function getManageChapter(
  slug: string,
  chapterId: string
): Promise<{ chapter: Chapter; content: string; novelName: string; postedBy: string } | null> {
  const res = await fetch(`${BE_URL}/api/v1/novels/${slug}/chapters/${chapterId}`, {
    headers: { Cookie: await cookieHeader() },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const c = (await res.json()) as {
    id: string;
    number: number;
    title: string;
    price: number;
    content: string;
    novel: { id: string; name: string; postedBy: { id: string; name: string } | null };
  };
  return {
    chapter: { id: c.id, number: c.number, title: c.title, filename: "", price: c.price },
    content: c.content ?? "",
    novelName: c.novel?.name ?? "",
    postedBy: c.novel?.postedBy?.id ?? "",
  };
}
