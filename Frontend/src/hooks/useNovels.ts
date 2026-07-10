import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { novelsApi } from "@/lib/api/novels";
import { useAuthStore } from "@/stores/userStore";
import { showToast } from "@/lib/toast";

// ── Queries ───────────────────────────────────────────────────────────────────

export function useNovelsByIds(ids: string[], enabled = true) {
  return useQuery({
    queryKey: ["novels-by-ids", ids.join(",")],
    queryFn: () => novelsApi.getByIds(ids),
    enabled: enabled && ids.length > 0,
  });
}

export function useMyNovels() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["my-novels", user?.id],
    queryFn: () => novelsApi.getMyNovels(),
    enabled: !!user,
  });
}

export function useMyNovelsStats() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["my-novels-stats", user?.id],
    queryFn: () => novelsApi.getMyNovelsStats(),
    enabled: !!user,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useDeleteNovel(onDeleted?: (slug: string) => void) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (slug: string) => novelsApi.delete(slug),
    onSuccess: (_, slug) => {
      showToast.success("Đã xóa truyện");
      queryClient.invalidateQueries({ queryKey: ["my-novels", user?.id] });
      if (onDeleted) onDeleted(slug);
    },
    onError: () => showToast.error("Xóa thất bại"),
  });
}

// BE nhận cover trong CÙNG request tạo truyện (FileInterceptor('cover') trên POST /novels)
// → chỉ cần 1 lần gọi, không cần bước upload ảnh riêng như trước.
export function useCreateNovel() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (formData: FormData) => novelsApi.create(formData),
    onSuccess: () => {
      showToast.success("Đăng truyện thành công");
      queryClient.invalidateQueries({ queryKey: ["my-novels", user?.id] });
    },
    onError: (e: Error) => showToast.error(e.message ?? "Đăng truyện thất bại"),
  });
}

export function useUpdateNovel(slug: string) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (data: object) => novelsApi.update(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-novels", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["novel", slug] });
    },
    onError: (e: Error) => showToast.error(e.message ?? "Cập nhật thất bại"),
  });
}

export function useNominateNovel(slug: string) {
  const { user, accessToken, setUser } = useAuthStore();

  return useMutation({
    mutationFn: () => novelsApi.nominate(slug),
    onSuccess: (data) => {
      if (user && accessToken) {
        setUser({ ...user, recommendationTicket: data.remainingTickets }, accessToken);
      }
      showToast.success("Đề cử thành công! 🎫", `Bạn còn ${data.remainingTickets} vé`);
    },
    onError: (err: Error) => showToast.error(err.message ?? "Không thể kết nối máy chủ"),
  });
}
