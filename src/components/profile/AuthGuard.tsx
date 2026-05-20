"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) router.replace("/unauthorized");
  }, [mounted, user, router]);

  if (!mounted || !user) return null;

  return <>{children}</>;
}
