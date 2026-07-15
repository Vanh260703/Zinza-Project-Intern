import { NextRequest, NextResponse } from "next/server";
import { normalizeNovel, type BeNovel } from "@/lib/normalizeNovel";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// GET /api/novels/random — 1 truyện ngẫu nhiên → Novel | null
export async function GET(_req: NextRequest) {
  const res = await fetch(`${BE_URL}/api/v1/novels/random`);
  if (!res.ok) return NextResponse.json(null, { status: res.status });

  const novel = (await res.json()) as BeNovel | null;
  return NextResponse.json(novel ? normalizeNovel(novel) : null);
}
