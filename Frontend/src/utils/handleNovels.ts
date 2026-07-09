import type { Novel } from "@/types/novel";

// Lấy ra truyện mới nhất
// Truyện có updatedAt → sort theo thời gian giảm dần
// Truyện không có updatedAt → coi là cũ hơn, sort theo hot score
export function getNew(allNovels: Novel[], limit = 5): Novel[] {
  const hotScore = (s: Novel) => s.commentCount + s.nominations;

  const withDate = allNovels.filter((s) => !!s.updatedAt);
  const withoutDate = allNovels.filter((s) => !s.updatedAt);

  const sortedWithDate = [...withDate].sort(
    (a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
  );
  const sortedWithoutDate = [...withoutDate].sort((a, b) => hotScore(b) - hotScore(a));

  return [...sortedWithDate, ...sortedWithoutDate].slice(0, limit);
}

// Lấy ra truyện hot
export function getHot(allNovels: Novel[], limit = 5): Novel[] {
  const hotScore = (s: Novel) => s.commentCount + s.nominations;
  return allNovels.sort((a, b) => hotScore(b) - hotScore(a)).slice(0, limit);
}

// Lấy ra truyện được đề cử theo lịch sử đọc
export function getNominated(allNovels: Novel[], history: string[], limit = 5): Novel[] {
  const byNominations = [...allNovels].sort((a, b) => b.nominations - a.nominations);

  if (!history.length) return byNominations.slice(0, limit);

  const readSet = new Set(history);
  // Dùng slug (string) thay vì object reference để Set.has() hoạt động đúng
  const readCategories = new Set(
    allNovels.filter((s) => readSet.has(s.id)).flatMap((s) => s.categories.map((c) => c.slug))
  );

  const recommended = byNominations.filter(
    (s) => !readSet.has(s.id) && s.categories.some((c) => readCategories.has(c.slug))
  );

  if (recommended.length < limit) {
    const seen = new Set(recommended.map((s) => s.id));
    const filler = byNominations.filter((s) => !readSet.has(s.id) && !seen.has(s.id));
    return [...recommended, ...filler].slice(0, limit);
  }

  return recommended.slice(0, limit);
}

// Lấy ra truyện ngẫu nhiên
export function getRandomNovel(allNovels: Novel[]): Novel | null {
  if (!allNovels.length) return null;
  const ratingNovels = allNovels.filter((s) => s.rating >= 4.5);
  const pool = ratingNovels.length ? ratingNovels : allNovels;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Lấy ra ranking truyện theo ngày, tuần, tháng (hiện tại mock data)
export type RankingPeriod = "day" | "week" | "month";

export function getRankingNovels(
  allNovels: Novel[],
  period: RankingPeriod = "month",
  limit = 5
): Novel[] {
  const score = (s: Novel): number => {
    switch (period) {
      case "day":
        return s.nominations * 0.5 + s.rating * 10;
      case "week":
        return s.nominations * 0.7 + s.commentCount * 2;
      case "month":
        return s.nominations + s.commentCount;
    }
  };
  return [...allNovels].sort((a, b) => score(b) - score(a)).slice(0, limit);
}

// Lấy ra truyện VIP
export function getVipNovels(allNovels: Novel[]): Novel[] {
  return allNovels.filter((s) => s.vip);
}
