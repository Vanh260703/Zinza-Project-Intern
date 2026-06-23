import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { novelsApi } from "@/lib/api/novels";
import { useAuthStore } from "@/stores/userStore";
import { showToast } from "@/lib/toast";

// ── Queries ───────────────────────────────────────────────────────────────────

export function useMyNovels() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["my-novels", user?.id],
    queryFn: () => novelsApi.getByUser(user!.id),
    enabled: !!user,
  });
}

export function useNovelById(id: string) {
  return useQuery({
    queryKey: ["novel", id],
    queryFn: () => novelsApi.getById(id),
    enabled: !!id,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useDeleteNovel(onDeleted?: (id: string) => void) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (id: string) => novelsApi.delete(id, user?.id ?? ""),
    onSuccess: (_, id) => {
      showToast.success("Đã xóa truyện");
      queryClient.invalidateQueries({ queryKey: ["my-novels", user?.id] });
      if (onDeleted) onDeleted(id);
    },
    onError: () => showToast.error("Xóa thất bại"),
  });
}

export function useCreateNovel(coverFileRef?: { current: File | null }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (data: object) => {
      const json = await novelsApi.create(data);
      if (json.message) throw new Error(json.message);
      const file = coverFileRef?.current;
      if (file) {
        const form = new FormData();
        form.append("cover", file);
        const res = await fetch(`/api/cover/${json.story.id}`, { method: "POST", body: form });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          showToast.error(err.message ?? "Upload ảnh bìa thất bại");
          throw new Error("cover_upload_failed");
        }
      }
      return json;
    },
    onSuccess: () => {
      showToast.success("Đăng truyện thành công");
      queryClient.invalidateQueries({ queryKey: ["my-novels", user?.id] });
    },
    onError: (e: Error) => {
      if (e.message !== "cover_upload_failed") showToast.error(e.message ?? "Đăng truyện thất bại");
    },
  });
}

export function useUpdateNovel(novelId: string) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (data: object) => novelsApi.update(novelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-novels", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["novel", novelId] });
    },
    onError: (e: Error) => showToast.error(e.message ?? "Cập nhật thất bại"),
  });
}

export function useNominateNovel(storyId: string) {
  const { user, accessToken, setUser } = useAuthStore();

  return useMutation({
    mutationFn: () => novelsApi.nominate(storyId, user!.id),
    onSuccess: (data) => {
      setUser(data.user, accessToken!);
      showToast.success("Đề cử thành công! 🎫", `Bạn còn ${data.user.recommendationTicket} vé`);
    },
    onError: () => showToast.error("Không thể kết nối máy chủ"),
  });
}
