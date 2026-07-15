import { NextRequest, NextResponse } from "next/server";
import type { Chapter } from "@/types/chapter";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Params = Promise<{ id: string }>; // [id] = slug

type BeChapter = {
  id: string;
  number: number;
  title: string;
  price: number;
  wordCount?: number;
  createdAt?: string;
};

// GET /api/novels/:slug/chapters — danh sách chương cho trang quản lý → Chapter[]
export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { id: slug } = await params;
  const res = await fetch(`${BE_URL}/api/v1/novels/${slug}/chapters?limit=100000`, {
    headers: { Cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json([], { status: res.status });

  const json = (await res.json()) as { data?: BeChapter[] };
  const chapters: Chapter[] = (json.data ?? []).map((c) => ({
    id: c.id,
    number: c.number,
    title: c.title,
    filename: "",
    price: c.price,
    wordCount: c.wordCount,
    createdAt: c.createdAt,
  }));
  return NextResponse.json(chapters);
}

// POST /api/novels/:slug/chapters — tạo chương. BE check owner qua cookie.
export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { id: slug } = await params;
  const body = await req.json();

  // Whitelist field theo CreateChapterDto (bỏ userId...)
  const payload: Record<string, unknown> = {
    title: body.title,
    content: body.content,
  };
  if (body.price !== undefined) payload.price = body.price;

  const res = await fetch(`${BE_URL}/api/v1/novels/${slug}/chapters`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") ?? "" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
