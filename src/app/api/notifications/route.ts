import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const all = req.nextUrl.searchParams.get("all") === "true";
  const data = all ? db.notifications.getAll(userId) : db.notifications.getByUser(userId, 4);
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  db.notifications.markAllRead(userId);
  return NextResponse.json({ ok: true });
}
