"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const hadUser = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (user) hadUser.current = true;
  }, [user]);

  useEffect(() => {
    // Chỉ redirect nếu user chưa từng login (truy cập trực tiếp khi chưa đăng nhập)
    // Không redirect nếu đang logout — logout handler tự xử lý navigation
    if (mounted && !user && !hadUser.current) {
      router.replace("/unauthorized");
    }
  }, [mounted, user, router]);

  if (!mounted || !user) return null;

  return <>{children}</>;
}
