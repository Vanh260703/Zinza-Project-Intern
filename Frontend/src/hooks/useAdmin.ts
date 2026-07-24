import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { showToast } from "@/lib/toast";
import type { Novel } from "@/types/novel";

type NovelRow = Novel & { publisherName?: string; publisherEmail?: string };

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
    slug: string;
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
    queryFn: async (): Promise<NovelRow[]> => {
      const [novels, users] = await Promise.all([
        fetch("/api/novels?limit=1000").then((r) => r.json()),
        adminApi.getUsers(),
      ]);
      const map: Record<string, { name: string; email: string }> = {};
      (users as { id: string; name: string; email: string }[]).forEach((u) => {
        map[u.id] = { name: u.name, email: u.email };
      });
      return (novels as Novel[]).map((s) => ({
        ...s,
        publisherName: map[s.postedBy]?.name,
        publisherEmail: map[s.postedBy]?.email,
      }));
    },
  });
}

export function useAdminNovelDetail(slug: string) {
  return useQuery({
    queryKey: ["admin-novel-detail", slug],
    queryFn: async () => {
      const novelRes = await fetch(`/api/novels/${slug}`);
      if (!novelRes.ok) throw new Error("NOT_FOUND");
      const novel = (await novelRes.json()) as Novel;
      const chapters = await fetch(`/api/novels/${slug}/chapters`).then((r) => r.json());

      // postedBy chỉ là id (normalizeNovel unwrap) → tra thêm tên/email qua admin user detail
      let publisherName: string | undefined;
      let publisherEmail: string | undefined;
      if (novel.postedBy) {
        const publisher = await adminApi
          .getUserById(novel.postedBy)
          .catch(() => null as { name: string; email: string } | null);
        publisherName = publisher?.name;
        publisherEmail = publisher?.email;
      }

      return {
        novel: {
          ...novel,
          publisherName,
          publisherEmail,
          publisherId: novel.postedBy,
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
    enabled: !!slug,
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
      showToast.success(`Đã nạp ${data.candy.toLocaleString()} kẹo`);
      queryClient.setQueryData<{ candy: number }>(
        ["admin-user", targetUserId],
        (prev) => (prev ? { ...prev, candy: data.candy } : prev)
      );
    },
    onError: (e: Error) => showToast.error(e.message ?? "Nạp kẹo thất bại"),
  });
}
