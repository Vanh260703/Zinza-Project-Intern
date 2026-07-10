import type { Category } from "@/types/category";
import { apiFetch } from "./client";

export const categoriesApi = {
  list: (): Promise<Category[]> => apiFetch("/api/categories").then((r) => r.json()),
};
