import { useAuthStore } from "@/stores/userStore";

// single-flight: mọi request 401 đồng thời share chung 1 lần refresh
// → tránh nhiều lần rotate refresh_token cùng lúc gây logout oan
let refreshing: Promise<boolean> | null = null;

function refreshOnce(): Promise<boolean> {
  // credentials: "include" → chắc chắn browser đính kèm httpOnly cookie
  // (refresh_token). Proxy /api/auth/refresh-token sẽ forward cookie này lên BE.
  refreshing ??= fetch("/api/auth/refresh-token", {
    method: "POST",
    credentials: "include",
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

/**
 * fetch wrapper: gặp 401 → refresh access_token (single-flight) rồi retry 1 lần.
 * Refresh thất bại → logout + về trang đăng nhập.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  // luôn gửi cookie (access_token) — không ghi đè nếu caller đã set
  const opts: RequestInit = { credentials: "include", ...init };

  const res = await fetch(input, opts);
  if (res.status !== 401) return res;

  const ok = await refreshOnce();
  if (!ok) {
    useAuthStore.getState().logout();
    if (typeof window !== "undefined") window.location.href = "/auth/login";
    return res;
  }

  // retry với cookie mới; không refresh lần 2 để tránh vòng lặp
  return fetch(input, opts);
}
