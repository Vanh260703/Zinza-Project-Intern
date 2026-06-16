"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/userStore";
import { useLibraryStore } from "@/stores/libraryStore";
import { useReaderStore } from "@/stores/readerStore";

export default function StoreHydrator() {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useLibraryStore.persist.rehydrate();
    useReaderStore.persist.rehydrate();
  }, []);

  return null;
}
