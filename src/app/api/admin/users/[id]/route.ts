import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = db.users.findById(id);
  if (!user) return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });
  const { password: _, ...safe } = user;
  return NextResponse.json(safe);
}
