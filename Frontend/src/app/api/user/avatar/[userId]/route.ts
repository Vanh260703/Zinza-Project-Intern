import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

const UPLOAD_DIR = path.join(process.cwd(), "upload", "avatars");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = db.users.findById(userId);

  if (!user?.avatarUrl) return new NextResponse(null, { status: 404 });

  const ext = path.extname(user.avatarUrl) || ".jpg";
  const filePath = path.join(UPLOAD_DIR, userId, `avatar${ext}`);

  if (!fs.existsSync(filePath)) return new NextResponse(null, { status: 404 });

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const user = db.users.findById(userId);
  if (!user) return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("avatar");

  if (!file || !(file instanceof File))
    return NextResponse.json({ message: "Không có file ảnh" }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ message: "Chỉ hỗ trợ JPG, PNG, WebP" }, { status: 400 });

  if (file.size > MAX_SIZE)
    return NextResponse.json({ message: "Ảnh tối đa 2MB" }, { status: 400 });

  const ext = file.type === "image/jpeg" ? ".jpg" : file.type === "image/png" ? ".png" : ".webp";
  const dir = path.join(UPLOAD_DIR, userId);
  fs.mkdirSync(dir, { recursive: true });

  // Xóa avatar cũ nếu có
  if (user.avatarUrl) {
    const oldExt = path.extname(user.avatarUrl);
    const oldPath = path.join(dir, `avatar${oldExt}`);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, `avatar${ext}`), buffer);

  const avatarUrl = `/api/user/avatar/${userId}`;
  db.users.update(userId, { avatarUrl });

  return NextResponse.json({ avatarUrl });
}
