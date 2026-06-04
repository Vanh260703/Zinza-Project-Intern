"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import ErrorPage from "@/components/error/ErrorPage";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const hadUser = useRef(false);

  // mounted đảm bảo Zustand đã hydrate + commit user vào React state
  // trước khi chúng ta check quyền — tránh race condition với onFinishHydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) hadUser.current = true;
  }, [user]);

  useEffect(() => {
    if (!mounted) return;
    if (!user && !hadUser.current) router.replace("/auth/login");
  }, [mounted, user, router]);

  if (!mounted) return null;

  // Đã đăng nhập nhưng không phải admin → 403
  if (user && user.role !== "admin") {
    return <ErrorPage code={403} title="Không có quyền truy cập" description="" />;
  }

  if (!user) return null;

  return <>{children}</>;
}
