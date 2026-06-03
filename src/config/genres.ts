export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export const GENRES: Genre[] = [
  { id: "1", name: "Huyền Huyễn", slug: "huyen-huyen" },
  { id: "2", name: "Huyền Nghi", slug: "huyen-nghi" },
  { id: "3", name: "Kỳ Ảo", slug: "ky-ao" },
  { id: "4", name: "Tiên Hiệp", slug: "tien-hiep" },
  { id: "5", name: "Đô Thị", slug: "do-thi" },
];

// Lookup theo name (dùng cho mock DB: string → Genre)
export const GENRE_BY_NAME: Record<string, Genre> = Object.fromEntries(
  GENRES.map((g) => [g.name, g])
);

// Lookup theo slug (dùng cho filter URL params)
export const GENRE_BY_SLUG: Record<string, Genre> = Object.fromEntries(
  GENRES.map((g) => [g.slug, g])
);
