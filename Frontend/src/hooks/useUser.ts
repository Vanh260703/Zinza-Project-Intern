import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, notificationsApi, type ReadHistoryEntry } from "@/lib/api/user";
import { apiFetch } from "@/lib/api/client";
import { useAuthStore } from "@/stores/userStore";
import { showToast } from "@/lib/toast";

// Queries

export function useNotifications() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => notificationsApi.getAll(user!.id),
    enabled: !!user,
  });
}

export function useReadingHistory() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["read-history", user?.id],
    queryFn: () => userApi.getReadHistory(),
    enabled: !!user,
  });
}

// Mutations
export function useMarkAllRead() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(user!.id),
    onSuccess: () => {
      type NotifData = { notifications: { isRead: boolean }[]; totalUnread: number };
      queryClient.setQueryData<NotifData>(["notifications", user?.id], (prev) =>
        prev
          ? {
              ...prev,
              notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
              totalUnread: 0,
            }
          : prev
      );
    },
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: object) => userApi.updateProfile(data),
    onSuccess: (json) => {
      const { user: currentUser, accessToken } = useAuthStore.getState();
      // Merge để giữ các field client-side không có trong response BE
      useAuthStore.getState().setUser({ ...currentUser!, ...json.user }, accessToken ?? "");
      showToast.success("Đã lưu thay đổi");
    },
    onError: () => showToast.error("Lỗi kết nối, thử lại sau"),
  });
}

export function useUploadAvatar() {
  const { user, accessToken, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("avatar", file);
      return apiFetch(`/api/user/avatar/${user!.id}`, { method: "POST", body: form })
        .then(async (res) => {
          const data = await res.json() as { avatarUrl?: string; message?: string };
          if (!res.ok) throw new Error(data.message ?? "Upload thất bại");
          return data as { avatarUrl: string };
        });
    },
    onSuccess: (data) => {
      setUser({ ...user!, avatarUrl: data.avatarUrl }, accessToken!);
      showToast.success("Cập nhật ảnh đại diện thành công");
    },
    onError: () => showToast.error("Upload thất bại, thử lại sau"),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: object) => userApi.changePassword(data),
    onSuccess: () => showToast.success("Đổi mật khẩu thành công"),
    onError: (err: Error) => showToast.error(err.message ?? "Lỗi kết nối, thử lại sau"),
  });
}

export function useGiftCandy(slug: string) {
  const { user, setWallet } = useAuthStore();

  return useMutation({
    mutationFn: (amount: number) => userApi.giftCandy(slug, amount),
    onSuccess: (data, amount) => {
      if (user) setWallet({ userId: user.id, balance: data.remainingBalance });
      showToast.success(
        `Đã tặng ${amount} kẹo! 🍬`,
        `Bạn còn ${data.remainingBalance.toLocaleString()} kẹo`
      );
    },
    onError: (err: Error) => showToast.error(err.message ?? "Không thể kết nối máy chủ"),
  });
}

export function useDailyProgress() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["daily-progress", user?.id],
    queryFn: () => userApi.getDailyProgress(),
    enabled: !!user,
  });
}

export function useClaimDailyTicket() {
  const { user, accessToken, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userApi.claimDailyTicket(user!.id),
    onSuccess: (data: { message: string; recommendationTicket: number }) => {
      if (user && accessToken) {
        setUser({ ...user, recommendationTicket: data.recommendationTicket }, accessToken);
      }
      // Cập nhật lại card tiến độ (đã nhận hôm nay)
      queryClient.invalidateQueries({ queryKey: ["daily-progress", user?.id] });
      showToast.success("Nhận vé thành công! 🎫");
    },
    onError: () => showToast.error("Không thể kết nối máy chủ"),
  });
}

export function useRemoveReadingHistory() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  return useMutation({
    // recordId = UserNovelRead.id
    mutationFn: (recordId: string) =>
      userApi.removeReadingHistory(recordId).then(() => recordId),
    onSuccess: (recordId: string) => {
      queryClient.setQueryData<ReadHistoryEntry[]>(["read-history", user?.id], (prev) =>
        prev ? prev.filter((h) => h.id !== recordId) : prev
      );
    },
    onError: () => showToast.error("Xóa thất bại"),
  });
}
