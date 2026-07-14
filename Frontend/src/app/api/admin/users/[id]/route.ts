import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const res = await fetch(`${BE_URL}/api/v1/admin/users/${id}`, {
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  return NextResponse.json({ ...data, role: (data.role as string).toLowerCase() });
}
