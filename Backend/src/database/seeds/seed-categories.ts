import { DataSource } from 'typeorm';
import { Category } from 'src/modules/categories/entities/category.entity';
import { StoryJson } from './seed.config';

export async function seedCategories(
  ds: DataSource,
  data: StoryJson[],
): Promise<Map<string, Category>> {
  const repo = ds.getRepository(Category);
  const names = [...new Set(data.flatMap((s) => s.categories))];
  const map = new Map<string, Category>();

  for (const name of names) {
    let cat = await repo.findOne({ where: { name } });
    if (!cat) cat = await repo.save(repo.create({ name }));
    map.set(name, cat);
  }

  console.log(`📚 Categories: ${map.size}`);
  return map;
}
