import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("avatar");

  if (!file || !(file instanceof File))
    return NextResponse.json({ message: "Không có file ảnh" }, { status: 400 });

  const beForm = new FormData();
  beForm.append("file", file);

  const res = await fetch(`${BE_URL}/api/v1/user/upload-avatar`, {
    method: "POST",
    headers: { Cookie: req.headers.get("cookie") ?? "" },
    body: beForm,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
