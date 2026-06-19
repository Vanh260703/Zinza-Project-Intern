import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { showToast } from "@/lib/toast";
import type { Story } from "@/types/story";

type StoryRow = Story & { publisherName?: string; publisherEmail?: string };

export type AdminStats = {
  totalUsers: number;
  totalNovels: number;
  totalChapters: number;
  totalCandy: number;
  vipNovels: number;
  novelsByStatus: { pending: number; completed: number };
  recentUsers: { id: string; name: string; email: string; role: string; joinedAt?: string }[];
  recentNovels: {
    id: string;
    name: string;
    author: string;
    status: string;
    chapterCount: number;
    vip: boolean;
    posterUrl: string | null;
    updatedAt?: string;
  }[];
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: adminApi.getUsers,
  });
}

export function useAdminUserById(id: string) {
  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => adminApi.getUserById(id),
    enabled: !!id,
  });
}

export function useAdminNovels() {
  return useQuery({
    queryKey: ["admin-novels"],
    queryFn: async (): Promise<StoryRow[]> => {
      const [stories, users] = await Promise.all([
        fetch("/api/novels?all=true").then((r) => r.json()),
        adminApi.getUsers(),
      ]);
      const map: Record<string, { name: string; email: string }> = {};
      (users as { id: string; name: string; email: string }[]).forEach((u) => {
        map[u.id] = { name: u.name, email: u.email };
      });
      return (stories as Story[]).map((s) => ({
        ...s,
        publisherName: map[s.postedBy]?.name,
        publisherEmail: map[s.postedBy]?.email,
      }));
    },
  });
}

export function useAdminNovelDetail(novelId: string) {
  return useQuery({
    queryKey: ["admin-novel-detail", novelId],
    queryFn: async () => {
      const [stories, users, chapters] = await Promise.all([
        fetch(`/api/novels?ids=${novelId}`).then((r) => r.json()),
        adminApi.getUsers(),
        fetch(`/api/novels/${novelId}/chapters`).then((r) => r.json()),
      ]);
      const story = (stories as Story[])[0];
      if (!story) throw new Error("NOT_FOUND");
      const map: Record<string, { name: string; email: string }> = {};
      (users as { id: string; name: string; email: string }[]).forEach((u) => {
        map[u.id] = u;
      });
      return {
        novel: {
          ...story,
          publisherName: map[story.postedBy]?.name,
          publisherEmail: map[story.postedBy]?.email,
          publisherId: story.postedBy,
        },
        chStats: {
          total: chapters.length,
          paid: (chapters as { price?: number }[]).filter((c) => (c.price ?? 0) > 0)
            .length,
          totalWords: (chapters as { wordCount?: number }[]).reduce(
            (s, c) => s + (c.wordCount ?? 0),
            0
          ),
        },
      };
    },
    enabled: !!novelId,
  });
}

export function useAdminDashboard() {
  return useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: adminApi.getDashboard,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useTopupUser(targetUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount }: { amount: number }) =>
      adminApi.topupUser(targetUserId, amount),
    onSuccess: (data) => {
      showToast.success(`Đã nạp ${data.user.candy.toLocaleString()} kẹo`);
      queryClient.setQueryData(["admin-user", targetUserId], data.user);
    },
    onError: (e: Error) => showToast.error(e.message ?? "Nạp kẹo thất bại"),
  });
}
