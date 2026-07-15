import { headers } from "next/headers";
import type { Novel } from "@/types/novel";

// Base URL để server component gọi chính proxy của Next (same-origin)
async function base() {
  const h = await headers();
  const host = h.get("host")!;
  const proto =
    h.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${await base()}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export const homeApi = {
  list: (qs: string) => getJson<Novel[]>(`/api/novels?${qs}`, []),
  random: () => getJson<Novel | null>("/api/novels/random", null),
  rankings: () =>
    getJson<{ day: Novel[]; week: Novel[]; month: Novel[] }>("/api/novels/rankings", {
      day: [],
      week: [],
      month: [],
    }),
};
