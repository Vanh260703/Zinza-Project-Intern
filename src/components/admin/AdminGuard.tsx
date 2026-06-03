"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import ErrorPage from "@/components/error/ErrorPage";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const hadUser = useRef(false);

  // Dùng persist.hasHydrated() để check ngay lập tức,
  // onFinishHydration() callback để set state khi hydration xong —
  // tránh gọi setState trực tiếp trong effect body (ESLint react-hooks/set-state-in-effect)
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (user) hadUser.current = true;
  }, [user]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user && !hadUser.current) router.replace("/unauthorized");
  }, [hydrated, user, router]);

  if (!hydrated) return null;

  // Đã đăng nhập nhưng không phải admin → 403
  if (user && user.role !== "admin") {
    return (
      <ErrorPage
        code={403}
        title="Không có quyền truy cập"
        description="Trang này chỉ dành cho quản trị viên."
      />
    );
  }

  // Chưa đăng nhập → chờ redirect
  if (!user) return null;

  return <>{children}</>;
}
