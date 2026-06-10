"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/userStore";
import ErrorPage from "@/components/error/ErrorPage";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist?.hasHydrated() ?? false);

  useEffect(() => {
    if (useAuthStore.persist?.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist?.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  if (!hydrated) return null;

  if (!user) {
    return (
      <ErrorPage
        code={401}
        title="Bạn chưa đăng nhập"
        description="Vui lòng đăng nhập để truy cập trang này."
        action={{ label: "Đăng nhập", href: "/auth/login" }}
      />
    );
  }

  if (user.role !== "admin") {
    return (
      <ErrorPage
        code={403}
        title="Không có quyền truy cập"
        description="Trang này chỉ dành cho quản trị viên."
      />
    );
  }

  return <>{children}</>;
}
