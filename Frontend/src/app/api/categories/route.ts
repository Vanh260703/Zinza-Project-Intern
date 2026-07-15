import { NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// GET /api/categories — danh sách thể loại thật từ BE (UUID thật, dùng khi tạo truyện).
// Dữ liệu công khai, hiếm khi đổi → cache dài.
export async function GET() {
  const res = await fetch(`${BE_URL}/api/v1/categories`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return NextResponse.json([], { status: res.status });

  const categories = await res.json();
  return NextResponse.json(categories);
}
