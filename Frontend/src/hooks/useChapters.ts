import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chaptersApi } from "@/lib/api/novels";
import { userApi } from "@/lib/api/user";
import { useAuthStore } from "@/stores/userStore";
import { showToast } from "@/lib/toast";

// ── Queries ───────────────────────────────────────────────────────────────────

export function useChapters(slug: string) {
  return useQuery({
    queryKey: ["chapters", slug],
    queryFn: () => chaptersApi.getByNovel(slug),
    enabled: !!slug,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useDeleteChapter(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chapterId: string) => chaptersApi.delete(slug, chapterId),
    onSuccess: (_, chapterId) => {
      queryClient.setQueryData(
        ["chapters", slug],
        (prev: Awaited<ReturnType<typeof chaptersApi.getByNovel>> | undefined) =>
          prev ? prev.filter((c) => c.id !== chapterId) : []
      );
    },
    onError: () => showToast.error("Xóa chương thất bại"),
  });
}

export function useCreateChapter(slug: string, nextNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: object) => chaptersApi.create(slug, data),
    onSuccess: () => {
      showToast.success(`Đã đăng chương ${nextNumber}`);
      queryClient.invalidateQueries({ queryKey: ["chapters", slug] });
    },
  });
}

export function useUpdateChapter(slug: string, chapterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: object) => chaptersApi.update(slug, chapterId, data),
    onSuccess: () => {
      showToast.success("Đã cập nhật chương");
      queryClient.invalidateQueries({ queryKey: ["chapters", slug] });
    },
  });
}

export function useUnlockChapter(slug: string, chapterId: string) {
  const { user, setWallet } = useAuthStore();

  return useMutation({
    mutationFn: () => chaptersApi.unlock(slug, chapterId),
    onSuccess: (data) => {
      if (user) setWallet({ userId: user.id, balance: data.remainingBalance });
    },
    onError: (err: Error) => showToast.error(err.message ?? "Mở khoá thất bại"),
  });
}

export function useTrackDailyRead() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      novelId: string;
      chapterId: string;
      chapterTitle?: string;
      chapterNumber?: number;
    }) => userApi.trackDailyRead({ userId: user!.id, ...data }),
    onSuccess: () => {
      // BE đã ghi vào user_novel_reads → refetch lịch sử đọc + tiến độ vé
      queryClient.invalidateQueries({ queryKey: ["read-history", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["daily-progress", user?.id] });
    },
  });
}
