import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Admin users table lọc/sắp xếp phía client → lấy 1 lần với limit lớn.
export async function GET(req: NextRequest) {
  const res = await fetch(`${BE_URL}/api/v1/admin/users?limit=500`, {
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });
  const json = await res.json();
  if (!res.ok) return NextResponse.json(json, { status: res.status });

  const users = (json.data as { role: string }[]).map((u) => ({
    ...u,
    role: u.role.toLowerCase(),
  }));
  return NextResponse.json(users);
}
