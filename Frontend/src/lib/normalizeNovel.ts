import type { Status } from "@/enums/novel";
import type { Novel } from "@/types/novel";
import type { Category } from "@/types/category";

// Shape BE trả về (list toResponse + detail findOne). Các field detail là optional.
export type BeNovel = {
  id: string;
  slug: string;
  name: string;
  author: string;
  poster: string | null;
  status: Status;
  chapterCount: number;
  rating: number;
  nominations: number;
  views?: number;
  candyReceived?: number;
  vip: boolean;
  categories: Category[];
  tags: string[];
  updatedAt?: string;
  // detail-only
  ratingCount?: number;
  commentCount?: number;
  description?: string | null;
  postedBy?: { id: string; name: string } | null;
};

export function normalizeNovel(n: BeNovel): Novel {
  return {
    id: n.id,
    slug: n.slug,
    name: n.name,
    posterUrl: n.poster ?? null,
    status: n.status,
    // BE trả decimal (rating) dạng string → ép Number cho chắc
    chapterCount: Number(n.chapterCount ?? 0),
    rating: Number(n.rating ?? 0),
    ratingCount: Number(n.ratingCount ?? 0),
    commentCount: Number(n.commentCount ?? 0),
    nominations: Number(n.nominations ?? 0),
    views: Number(n.views ?? 0),
    candyReceived: Number(n.candyReceived ?? 0),
    author: n.author ?? "",
    postedBy: n.postedBy?.id ?? "", // id người đăng — dùng cho owner check (hiển thị tên qua field khác)
    categories: n.categories ?? [],
    tags: n.tags ?? [],
    description: n.description ?? "",
    vip: n.vip ?? false,
    price: 0, // BE list không có; home không dùng price
    updatedAt: n.updatedAt ? new Date(n.updatedAt) : undefined,
  };
}
