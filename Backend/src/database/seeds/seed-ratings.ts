import { DataSource } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';
import { NovelRating } from 'src/modules/novels/entities/novel-rating.entity';

export async function seedRatings(
  ds: DataSource,
  userMap: Map<string, User>,
  novelMap: Map<string, Novel>,
): Promise<void> {
  const ratingRepo = ds.getRepository(NovelRating);
  const novelRepo = ds.getRepository(Novel);

  const users = [...userMap.values()];
  const novels = [...novelMap.values()];
  let count = 0;

  for (const novel of novels) {
    const alreadySeeded = await ratingRepo.existsBy({
      novel: { id: novel.id },
    });
    if (alreadySeeded) continue;

    // Mỗi truyện nhận rating từ 3–5 user ngẫu nhiên
    const raters = users
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 3);

    const scores: number[] = [];

    for (const user of raters) {
      const score = Math.floor(Math.random() * 3) + 3; // 3–5
      await ratingRepo.save(ratingRepo.create({ user, novel, rating: score }));
      scores.push(score);
      count++;
    }

    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      await novelRepo.update(novel.id, {
        rating: Math.round(avg * 100) / 100,
        ratingCount: scores.length,
      });
    }
  }

  console.log(`⭐ Ratings: ${count}`);
}
