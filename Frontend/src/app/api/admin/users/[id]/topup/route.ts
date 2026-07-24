import { NextRequest, NextResponse } from "next/server";
import { topupSchema } from "@/schemas/admin";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const parsed = topupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const res = await fetch(`${BE_URL}/api/v1/admin/users/${id}/topup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") ?? "" },
    body: JSON.stringify(parsed.data),
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  return NextResponse.json({ candy: data.balanceAfter });
}
