import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

// GET /api/novels?ids=id1,id2,id3
// Lấy thông tin sách dựa vào id
export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids");
  if (!ids) return NextResponse.json([]);

  const idList = ids.split(",").filter(Boolean);
  const stories = idList
    .map((id) => db.stories.findById(id))
    .filter(Boolean);

  return NextResponse.json(stories);
}
