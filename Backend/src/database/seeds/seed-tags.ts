import { DataSource } from 'typeorm';
import { Tag } from 'src/modules/tags/entities/tag.entity';
import { StoryJson } from './seed.config';

export async function seedTags(
  ds: DataSource,
  data: StoryJson[],
): Promise<Map<string, Tag>> {
  const repo = ds.getRepository(Tag);
  const names = [
    ...new Set(data.flatMap((s) => s.tags).filter((t) => t !== '—')),
  ];
  const map = new Map<string, Tag>();

  for (const name of names) {
    let tag = await repo.findOne({ where: { name } });
    if (!tag) tag = await repo.save(repo.create({ name }));
    map.set(name, tag);
  }

  console.log(`🏷️  Tags: ${map.size}`);
  return map;
}
