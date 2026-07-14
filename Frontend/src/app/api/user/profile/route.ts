import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { userId: _, ...patch } = body as Record<string, unknown>;

  const res = await fetch(`${BE_URL}/api/v1/user/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify(patch),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const user = { ...data, role: (data.role as string).toLowerCase() };
  return NextResponse.json({ user });
}
