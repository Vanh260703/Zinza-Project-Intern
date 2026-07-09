import { NextRequest, NextResponse } from "next/server";
import { normalizeNovel, type BeNovel } from "@/lib/normalizeNovel";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type BeRankings = { day: BeNovel[]; week: BeNovel[]; month: BeNovel[] };

// GET /api/novels/rankings — BXH ngày/tuần/tháng → { day, week, month }: Novel[]
export async function GET(_req: NextRequest) {
  const res = await fetch(`${BE_URL}/api/v1/novels/rankings`);
  if (!res.ok) {
    return NextResponse.json({ day: [], week: [], month: [] }, { status: res.status });
  }

  const r = (await res.json()) as BeRankings;
  return NextResponse.json({
    day: (r.day ?? []).map(normalizeNovel),
    week: (r.week ?? []).map(normalizeNovel),
    month: (r.month ?? []).map(normalizeNovel),
  });
}
