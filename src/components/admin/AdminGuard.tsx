"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import ErrorPage from "@/components/error/ErrorPage";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const user    = useAuthStore((s) => s.user);
  const router  = useRouter();
  const [mounted, setMounted] = useState(false);
  const hadUser = useRef(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (user) hadUser.current = true; }, [user]);

  useEffect(() => {
    if (!mounted) return;
    if (!user && !hadUser.current) router.replace("/unauthorized");
  }, [mounted, user, router]);

  if (!mounted) return null;

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
