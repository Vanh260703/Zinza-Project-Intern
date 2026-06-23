import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { removeDiacritics } from "@/utils/removeDiacritics";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = parseInt(searchParams.get("limit") ?? "4", 10);

  if (!q) return NextResponse.json({ results: [], total: 0 });

  const normalizedQ = removeDiacritics(q.toLowerCase());
  const all = db.stories.getAll();

  const matched = all.filter((s) => {
    const name = removeDiacritics(s.name.toLowerCase());
    const author = removeDiacritics(s.author.toLowerCase());
    return name.includes(normalizedQ) || author.includes(normalizedQ);
  });

  const results = matched.slice(0, limit).map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    author: s.author,
    posterUrl: s.posterUrl ?? null,
    categories: s.categories ?? [],
  }));

  return NextResponse.json({ results, total: matched.length });
}
