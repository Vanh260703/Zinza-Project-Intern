import type { Category } from "@/config/category";
import { apiFetch } from "./client";

export const categoriesApi = {
  // Danh sách thể loại thật (UUID thật) — dùng khi tạo/sửa truyện, khác CATEGORIES
  // hardcode trong config/category.ts (chỉ dùng cho hiển thị/lọc, id giả).
  list: (): Promise<Category[]> => apiFetch("/api/categories").then((r) => r.json()),
};
