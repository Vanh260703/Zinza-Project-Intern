import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, notificationsApi } from "@/lib/api/user";
import { useAuthStore } from "@/stores/userStore";
import { showToast } from "@/lib/toast";

// ── Queries ───────────────────────────────────────────────────────────────────

export function useNotifications() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => notificationsApi.getAll(user!.id),
    enabled: !!user,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

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
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: object) => userApi.updateProfile(data),
    onSuccess: (json) => {
      setUser(json.user, useAuthStore.getState().token ?? "");
      showToast.success("Đã lưu thay đổi");
    },
    onError: () => showToast.error("Lỗi kết nối, thử lại sau"),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: object) => userApi.changePassword(data),
    onSuccess: () => showToast.success("Đổi mật khẩu thành công"),
    onError: () => showToast.error("Lỗi kết nối, thử lại sau"),
  });
}

export function useGiftCandy() {
  const { user, setWallet } = useAuthStore();

  return useMutation({
    mutationFn: (amount: number) => userApi.giftCandy(user!.id, amount),
    onSuccess: (data, amount) => {
      setWallet(data.wallet);
      showToast.success(
        `Đã tặng ${amount} kẹo! 🍬`,
        `Bạn còn ${data.wallet.balance.toLocaleString()} kẹo`
      );
    },
    onError: () => showToast.error("Không thể kết nối máy chủ"),
  });
}

export function useClaimDailyTicket() {
  const { user, token, setUser } = useAuthStore();

  return useMutation({
    mutationFn: () => userApi.claimDailyTicket(user!.id),
    onSuccess: (data) => {
      setUser(data.user, token!);
      showToast.success("Nhận vé thành công! 🎫");
    },
    onError: () => showToast.error("Không thể kết nối máy chủ"),
  });
}

export function useRemoveReadingHistory() {
  const { user, token, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (storyId: string) =>
      userApi.removeReadingHistory(user!.id, storyId).then(() => storyId),
    onSuccess: (storyId: string) => {
      if (!user || !token) return;
      const updated = { ...user.lastReadChapters };
      delete updated[storyId];
      setUser({ ...user, lastReadChapters: updated }, token);
    },
    onError: () => showToast.error("Xóa thất bại"),
  });
}
