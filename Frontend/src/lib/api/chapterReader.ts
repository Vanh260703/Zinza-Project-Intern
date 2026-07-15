import { cookies } from "next/headers";
import type { Novel } from "@/types/novel";
import type { Chapter } from "@/types/chapter";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type BeChapterDetail = {
  id: string;
  number: number;
  title: string;
  content: string; // '' nếu chương khoá & user chưa mua (BE tự blank)
  price: number;
  wordCount: number;
  novel: { id: string; name: string; postedBy: { id: string; name: string } | null };
};
type BeChapterListItem = { id: string; number: number; title: string; price: number };

function toChapter(c: BeChapterListItem | BeChapterDetail): Chapter {
  return { id: c.id, number: c.number, title: c.title, filename: "", price: c.price };
}

// Server-side: gom dữ liệu cho trang đọc chương. Forward cookie để BE biết user đã mua chưa.
export async function getChapterReader(slug: string, chapterId: string) {
  const cookieHeader = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const [chRes, listRes] = await Promise.all([
    // Nội dung chương: forward cookie để BE biết user đã mua chưa → PHẢI giữ no-store
    // (cache sẽ làm lộ nội dung đã mua/khoá của user này sang user khác).
    fetch(`${BE_URL}/api/v1/novels/${slug}/chapters/${chapterId}`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    }),
    // Danh sách chương để điều hướng: công khai, không cá nhân hoá → cache được.
    fetch(`${BE_URL}/api/v1/novels/${slug}/chapters?limit=100000`, { next: { revalidate: 60 } }),
  ]);

  if (!chRes.ok) return null;
  const detail = (await chRes.json()) as BeChapterDetail;

  const listData: BeChapterListItem[] = listRes.ok ? ((await listRes.json()).data ?? []) : [];
  const allChapters: Chapter[] = listData.map(toChapter);

  const idx = allChapters.findIndex((c) => c.id === chapterId);
  const prev = idx > 0 ? allChapters[idx - 1] : null;
  const next = idx >= 0 && idx < allChapters.length - 1 ? allChapters[idx + 1] : null;

  const novel: Novel = {
    id: detail.novel.id,
    slug,
    name: detail.novel.name,
    posterUrl: null,
    status: "PENDING",
    chapterCount: allChapters.length,
    rating: 0,
    ratingCount: 0,
    commentCount: 0,
    nominations: 0,
    views: 0,
    candyReceived: 0,
    author: "",
    postedBy: detail.novel.postedBy?.id ?? "",
    categories: [],
    tags: [],
    description: "",
    vip: false,
    price: 0,
  };

  return {
    novel,
    chapter: toChapter(detail),
    content: detail.content ?? "",
    prev,
    next,
    allChapters,
    posterName: detail.novel.postedBy?.name ?? "",
  };
}
