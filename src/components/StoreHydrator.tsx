"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/userStore";
import { useLibraryStore } from "@/stores/libraryStore";
import { useReaderStore } from "@/stores/readerStore";

/**
 * Trigger hydration cho tất cả persist stores SAU khi React mount xong.
 * Đặt ở root layout để chạy 1 lần toàn app.
 *
 * Tại sao: Zustand persist mặc định đọc localStorage ĐỒNG BỘ trước khi
 * React render lần đầu trên client → server (null) ≠ client (có data)
 * → Hydration mismatch. skipHydration + component này giải quyết triệt để.
 */
export default function StoreHydrator() {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useLibraryStore.persist.rehydrate();
    useReaderStore.persist.rehydrate();
  }, []);

  return null;
}
