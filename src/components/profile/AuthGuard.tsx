"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const hadUser = useRef(false);

  const [hydrated, setHydrated] = useState(() => useAuthStore.persist?.hasHydrated() ?? false);

  useEffect(() => {
    const unsub = useAuthStore.persist?.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (user) hadUser.current = true;
  }, [user]);

  useEffect(() => {
    if (hydrated && !user && !hadUser.current) {
      router.replace("/unauthorized");
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user) return null;

  return <>{children}</>;
}
