import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/schemas/auth";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Dữ liệu không hợp lệ", errors: result.error.flatten() },
      { status: 400 }
    );
  }

  // 1. Gọi BE login
  const beRes = await fetch(`${BE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.data),
  });

  if (!beRes.ok) {
    const err = await beRes.json().catch(() => ({}));
    return NextResponse.json(
      { message: err.message ?? "Email hoặc mật khẩu không đúng" },
      { status: beRes.status }
    );
  }

  const { user: beUser } = await beRes.json();

  // 2. Lấy Set-Cookie từ BE (access_token + refresh_token httpOnly)
  const setCookies = beRes.headers.getSetCookie();

  // 3. Fetch wallet bằng cookie mới vừa nhận
  const cookieStr = setCookies.map((c) => c.split(";")[0]).join("; ");
  const walletRes = await fetch(`${BE_URL}/api/v1/user/wallet`, {
    headers: { Cookie: cookieStr },
  });

  let wallet = { userId: beUser.id, balance: 0 };
  if (walletRes.ok) {
    const walletData = await walletRes.json();
    wallet = { userId: beUser.id, balance: walletData.balance ?? 0 };
  }

  // 4. Normalize: BE trả role UPPERCASE, FE dùng lowercase
  const user = { ...beUser, role: (beUser.role as string).toLowerCase() };

  // 5. Forward cookies xuống browser
  const res = NextResponse.json({ user, wallet });
  for (const cookie of setCookies) {
    res.headers.append("Set-Cookie", cookie);
  }

  return res;
}
