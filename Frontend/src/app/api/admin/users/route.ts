import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const PAGE_LIMIT = 200;

// Admin users table lọc/sắp xếp phía client → cần lấy TOÀN BỘ user, không chỉ 1 trang.
// BE có phân trang thật (meta.totalPages) — lặp lấy hết các trang thay vì hardcode limit.
export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const fetchPage = (page: number) =>
    fetch(`${BE_URL}/api/v1/admin/users?limit=${PAGE_LIMIT}&page=${page}`, {
      headers: { Cookie: cookie },
    }).then((r) => r.json());

  const first = await fetch(`${BE_URL}/api/v1/admin/users?limit=${PAGE_LIMIT}&page=1`, {
    headers: { Cookie: cookie },
  });
  const firstJson = await first.json();
  if (!first.ok) return NextResponse.json(firstJson, { status: first.status });

  const totalPages: number = firstJson.meta?.totalPages ?? 1;
  const restPages = await Promise.all(
    Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => fetchPage(i + 2))
  );

  const allData = [firstJson.data, ...restPages.map((p) => p.data)].flat();
  const users = (allData as { role: string }[]).map((u) => ({
    ...u,
    role: u.role.toLowerCase(),
  }));
  return NextResponse.json(users);
}
