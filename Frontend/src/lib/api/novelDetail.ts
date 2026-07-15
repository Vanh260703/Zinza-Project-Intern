import { normalizeNovel, type BeNovel } from "@/lib/normalizeNovel";
import type { Novel } from "@/types/novel";
import type { Chapter } from "@/types/chapter";
import type { Review } from "@/types/review";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type BeChapter = { id: string; number: number; title: string; price: number };
type BeRating = {
  id: string;
  rating: number;
  review: string | null;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
};

function daysAgo(iso: string): number {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

// Lấy trọn dữ liệu cho trang chi tiết truyện từ BE (server-side, dùng trong Server Component).
export async function getNovelDetail(slug: string): Promise<{
  novel: Novel;
  chapters: Chapter[];
  reviews: Review[];
  posterName: string;
} | null> {
  const novelRes = await fetch(`${BE_URL}/api/v1/novels/${slug}`, { next: { revalidate: 60 } });
  if (!novelRes.ok) return null;
  const novelJson = (await novelRes.json()) as BeNovel;
  const novel = normalizeNovel(novelJson);
  const posterName = novelJson.postedBy?.name ?? "";

  // limit lớn để lấy hết chương (ChaptersTab tự phân trang client-side)
  // Dữ liệu công khai (không cá nhân hoá) → cache với revalidate 60s thay vì no-store.
  const [chRes, rtRes] = await Promise.all([
    fetch(`${BE_URL}/api/v1/novels/${slug}/chapters?limit=100000`, { next: { revalidate: 60 } }),
    fetch(`${BE_URL}/api/v1/novels/${slug}/ratings?limit=20`, { next: { revalidate: 60 } }),
  ]);

  const chapters: Chapter[] = chRes.ok
    ? (((await chRes.json()).data ?? []) as BeChapter[]).map((c) => ({
        id: c.id,
        number: c.number,
        title: c.title,
        filename: "", // BE không trả filename; trang chi tiết không dùng
        price: c.price,
      }))
    : [];

  const reviews: Review[] = rtRes.ok
    ? (((await rtRes.json()).data ?? []) as BeRating[]).map((r) => ({
        id: r.id,
        novelId: novel.id,
        userId: r.user.id,
        userName: r.user.name,
        avatarUrl: r.user.avatarUrl,
        stars: r.rating,
        text: r.review ?? "",
        daysAgo: daysAgo(r.createdAt),
      }))
    : [];

  return { novel, chapters, reviews, posterName };
}
