export interface Category {
  id: string;
  name: string;
  slug: string;
}

export const CATEGORIES: Category[] = [
  { id: "1", name: "Huyền Huyễn", slug: "huyen-huyen" },
  { id: "2", name: "Huyền Nghi", slug: "huyen-nghi" },
  { id: "3", name: "Kỳ Ảo", slug: "ky-ao" },
  { id: "4", name: "Tiên Hiệp", slug: "tien-hiep" },
  { id: "5", name: "Đô Thị", slug: "do-thi" },
  { id: "6", name: "Võ Hiệp", slug: "vo-hiep" },
  { id: "7", name: "Lịch Sử", slug: "lich-su" },
];

// Lookup theo name (dùng cho mock DB: string → Category)
export const CATEGORY_BY_NAME: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.name, c])
);

// Lookup theo slug (dùng cho filter URL params)
export const CATEGORY_BY_SLUG: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c])
);
