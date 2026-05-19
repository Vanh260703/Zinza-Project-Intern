import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { removeDiacritics } from "@/utils/removeDiacritics";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "4");

  if (!q) return NextResponse.json({ results: [], total: 0 });

  const norm = removeDiacritics(q);
  const all = db.stories.getAll();

  const matched = all.filter(
    (s) =>
      removeDiacritics(s.name).includes(norm) ||
      removeDiacritics(s.author).includes(norm)
  );

  return NextResponse.json({
    results: matched.slice(0, limit).map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      author: s.author,
      poster: s.poster,
      genres: s.genres,
    })),
    total: matched.length,
  });
}
