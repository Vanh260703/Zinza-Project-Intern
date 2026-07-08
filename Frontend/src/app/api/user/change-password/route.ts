import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { currentPassword, newPassword, confirmPassword } = body as {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };

  const res = await fetch(`${BE_URL}/api/v1/user/change-password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
