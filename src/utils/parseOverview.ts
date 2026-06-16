export interface ParsedOverview {
  name: string;
  type: string;
  status: string;
  rating: number;
  ratingCount: number;
  commentCount: number;
  nominations: number;
  author: string;
  postedBy: string;
  genres: string[];
  tags: string[];
  description: string;
}

// Map key tiếng Việt trong file sang field name
const KEY_MAP: Record<string, keyof ParsedOverview> = {
  "tên truyện": "name",
  loại: "type",
  "trạng thái": "status",
  "đánh giá": "rating",
  "bình luận": "commentCount",
  "đề cử": "nominations",
  "tác giả": "author",
  "đăng bởi": "postedBy",
  "thể loại": "genres",
  tags: "tags",
};

export function parseOverview(raw: string): ParsedOverview {
  const lines = raw.split("\n").map((l) => l.trim());
  const descStart = lines.findIndex((l) => l.toLowerCase().startsWith("tóm tắt"));
  const headerLines = descStart === -1 ? lines : lines.slice(0, descStart);
  const description =
    descStart === -1
      ? ""
      : lines
          .slice(descStart + 1)
          .join("\n")
          .trim();

  const result: Partial<ParsedOverview> = { description };

  for (const line of headerLines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const rawKey = line.slice(0, colonIdx).trim().toLowerCase();
    const value = line.slice(colonIdx + 1).trim();
    const field = KEY_MAP[rawKey];
    if (!field) continue;

    switch (field) {
      // "4.894 ⭐ (150 lượt)" → rating: 4.894, ratingCount: 150
      case "rating": {
        result.rating = parseFloat(value) || 0;
        const match = value.match(/\((\d+)/);
        result.ratingCount = match ? parseInt(match[1]) : 0;
        break;
      }
      case "commentCount":
      case "nominations":
        result[field] = parseInt(value.replace(/\D/g, "")) || 0;
        break;
      case "genres":
      case "tags":
        result[field] = value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      default:
        (result as Record<string, unknown>)[field] = value;
    }
  }

  return {
    name: result.name ?? "",
    type: result.type ?? "",
    status: result.status ?? "",
    rating: result.rating ?? 0,
    ratingCount: result.ratingCount ?? 0,
    commentCount: result.commentCount ?? 0,
    nominations: result.nominations ?? 0,
    author: result.author ?? "",
    postedBy: result.postedBy ?? "",
    genres: result.genres ?? [],
    tags: result.tags ?? [],
    description: result.description ?? "",
  };
}
