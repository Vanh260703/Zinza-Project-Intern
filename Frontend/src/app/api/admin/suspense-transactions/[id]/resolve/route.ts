import { NextRequest, NextResponse } from "next/server";
import { resolveSuspenseSchema } from "@/schemas/admin";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const parsed = resolveSuspenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const res = await fetch(`${BE_URL}/api/v1/admin/suspense-transactions/${id}/resolve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") ?? "" },
    body: JSON.stringify(parsed.data),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
