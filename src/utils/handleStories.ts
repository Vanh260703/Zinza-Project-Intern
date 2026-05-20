import type { Story } from "@/types/story";

// Lấy ra truyện hot
export function getHot(allStories: Story[], limit = 5): Story[] {
  const hotScore = (s: Story) => (s.followers ?? 0) * 2 + s.commentCount + s.nominations;
  return allStories.sort((a, b) => hotScore(b) - hotScore(a)).slice(0, limit);
}

// Lấy ra truyện được đề cử theo lịch sử đọc
export function getNominated(allStories: Story[], history: string[], limit = 5): Story[] {
  const byNominations = [...allStories].sort((a, b) => b.nominations - a.nominations);

  if (!history.length) return byNominations.slice(0, limit);

  const readSet = new Set(history);
  const readGenres = new Set(
    allStories.filter((s) => readSet.has(s.id)).flatMap((s) => s.genres)
  );

  const recommended = byNominations.filter(
    (s) => !readSet.has(s.id) && s.genres.some((g) => readGenres.has(g))
  );

  if (recommended.length < limit) {
    const seen = new Set(recommended.map((s) => s.id));
    const filler = byNominations.filter((s) => !readSet.has(s.id) && !seen.has(s.id));
    return [...recommended, ...filler].slice(0, limit);
  }

  return recommended.slice(0, limit);
}

// Lấy ra truyện ngẫu nhiên
export function getRandomStory(allStories: Story[]): Story {
  const ratingStories = allStories.filter((s) => s.rating >= 4.5);
  const pool = ratingStories.length ? ratingStories : allStories;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Lấy ra ranking truyện theo ngày, tháng, năm (hiện tại mock data)
export function getRankingStories(allStories: Story[]): Story[] {
  return allStories.sort((a, b) => b.nominations - a.nominations).slice(0, 5);
}

// Lấy ra truyện VIP 
export function getVipStories(allStories: Story[]) : Story[] {
  return allStories.filter(s => s.vip);
}
