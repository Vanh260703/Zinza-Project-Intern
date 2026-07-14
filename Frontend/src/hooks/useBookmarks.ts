import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookmarksApi, type Bookmark } from "@/lib/api/bookmarks";
import { useAuthStore } from "@/stores/userStore";
import { showToast } from "@/lib/toast";

export function useBookmarks() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: () => bookmarksApi.list(),
    enabled: !!user,
  });
}

export function useToggleBookmark() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (novelId: string) => bookmarksApi.toggle(novelId),
    onSuccess: (data, novelId) => {
      // Cập nhật cache ngay: bỏ lưu → xoá khỏi list; lưu mới → refetch để có novel đầy đủ
      if (!data.bookmarked) {
        queryClient.setQueryData<Bookmark[]>(["bookmarks", user?.id], (prev) =>
          prev ? prev.filter((b) => b.novel.id !== novelId) : prev
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ["bookmarks", user?.id] });
      }
    },
    onError: () => showToast.error("Không thể cập nhật theo dõi"),
  });
}
