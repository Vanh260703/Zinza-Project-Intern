import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const res = await fetch(`${BE_URL}/api/v1/admin/stats`, {
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  return NextResponse.json({
    ...data,
    recentUsers: (data.recentUsers as { role: string }[]).map((u) => ({
      ...u,
      role: u.role.toLowerCase(),
    })),
  });
}
