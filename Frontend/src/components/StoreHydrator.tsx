"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/userStore";
import { useReaderStore } from "@/stores/readerStore";

export default function StoreHydrator() {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useReaderStore.persist.rehydrate();
  }, []);

  return null;
}
