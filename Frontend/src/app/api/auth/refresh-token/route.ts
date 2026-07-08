import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// POST /api/auth/refresh-token — forward refresh_token cookie lên BE,
// BE rotate rồi set lại access_token + refresh_token → forward Set-Cookie xuống browser
export async function POST(req: NextRequest) {
  const beRes = await fetch(`${BE_URL}/api/v1/auth/refresh-token`, {
    method: "POST",
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });

  const data = await beRes.json().catch(() => ({}));
  const res = NextResponse.json(data, { status: beRes.status });

  for (const cookie of beRes.headers.getSetCookie()) {
    res.headers.append("Set-Cookie", cookie);
  }

  return res;
}
