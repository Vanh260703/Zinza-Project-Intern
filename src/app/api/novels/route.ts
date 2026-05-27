import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { createNovelSchema } from "@/schemas/novel";

// GET /api/novels?ids=id1,id2,id3
// GET /api/novels?postedBy=userId
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const postedBy = searchParams.get("postedBy");
  if (postedBy) {
    return NextResponse.json(db.stories.getByUser(postedBy));
  }

  const ids = searchParams.get("ids");
  if (!ids) return NextResponse.json([]);

  const stories = ids
    .split(",")
    .filter(Boolean)
    .map((id) => db.stories.findById(id))
    .filter(Boolean);

  return NextResponse.json(stories);
}


// POST /api/novels
export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = createNovelSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Dữ liệu không hợp lệ", errors: result.error.flatten() },
      { status: 400 }
    );
  }

  await new Promise((r) => setTimeout(r, 500));

  const story = db.stories.create(result.data);
  return NextResponse.json({ story }, { status: 201 });
}
