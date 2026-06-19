import { NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

export async function GET() {
  const users = db.users.getAll();
  const stories = db.stories.getAll();

  const totalCandy =
    users.reduce((s, u) => s + (u.candy ?? 0), 0) +
    stories.reduce((total, s) => total + (s.price ?? 0), 0);
  const totalChapters = stories.reduce((s, n) => s + (n.chapterCount ?? 0), 0);
  const vipNovels = stories.filter((s) => s.vip).length;

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.joinedAt ?? 0).getTime() - new Date(a.joinedAt ?? 0).getTime())
    .slice(0, 5)
    .map(({ password: _, ...u }) => u);

  const recentNovels = [...stories]
    .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())
    .slice(0, 5);

  return NextResponse.json({
    totalUsers: users.length,
    totalNovels: stories.length,
    totalChapters,
    totalCandy,
    vipNovels,
    novelsByStatus: {
      pending: stories.filter((s) => s.status === "PENDING").length,
      completed: stories.filter((s) => s.status === "COMPLETED").length,
    },
    recentUsers,
    recentNovels,
  });
}
