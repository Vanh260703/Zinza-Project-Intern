import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chaptersApi } from "@/lib/api/novels";
import { userApi } from "@/lib/api/user";
import { useAuthStore } from "@/stores/userStore";
import { useLibraryStore } from "@/stores/libraryStore";
import { showToast } from "@/lib/toast";

// ── Queries ───────────────────────────────────────────────────────────────────

export function useChapters(novelId: string) {
  return useQuery({
    queryKey: ["chapters", novelId],
    queryFn: () => chaptersApi.getByNovel(novelId),
    enabled: !!novelId,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useDeleteChapter(novelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chapterId: string) => chaptersApi.delete(novelId, chapterId),
    onSuccess: (_, chapterId) => {
      queryClient.setQueryData(
        ["chapters", novelId],
        (prev: Awaited<ReturnType<typeof chaptersApi.getByNovel>> | undefined) =>
          prev ? prev.filter((c) => c.id !== chapterId) : []
      );
    },
    onError: () => showToast.error("Xóa chương thất bại"),
  });
}

export function useCreateChapter(novelId: string, nextNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: object) => chaptersApi.create(novelId, data),
    onSuccess: () => {
      showToast.success(`Đã đăng chương ${nextNumber}`);
      queryClient.invalidateQueries({ queryKey: ["chapters", novelId] });
    },
  });
}

export function useUpdateChapter(novelId: string, chapterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: object) => chaptersApi.update(novelId, chapterId, data),
    onSuccess: () => {
      showToast.success("Đã cập nhật chương");
      queryClient.invalidateQueries({ queryKey: ["chapters", novelId] });
    },
  });
}

export function useUnlockChapter(storyId: string, chapterId: string) {
  const { user, setWallet } = useAuthStore();
  const addPurchasedChapter = useLibraryStore((s) => s.addPurchasedChapter);

  return useMutation({
    mutationFn: () => chaptersApi.unlock(storyId, chapterId, user!.id),
    onSuccess: (data) => {
      setWallet(data.wallet);
      addPurchasedChapter(chapterId);
    },
  });
}

export function useTrackDailyRead() {
  const { user, token, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: {
      storyId: string;
      chapterId: string;
      chapterTitle?: string;
      chapterNumber?: number;
    }) => userApi.trackDailyRead({ userId: user!.id, ...data }),
    onSuccess: (data) => {
      if (data.user) setUser(data.user, token!);
    },
  });
}
