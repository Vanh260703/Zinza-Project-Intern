import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Category } from 'src/modules/categories/entities/category.entity';
import { Tag } from 'src/modules/tags/entities/tag.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';
import { NovelCategory } from 'src/modules/novels/entities/novel-category.entity';
import { NovelTag } from 'src/modules/novels/entities/novel-tag.entity';
import { Chapter } from 'src/modules/chapters/entities/chapter.entity';
import { Status } from 'src/modules/novels/enums';
import { UPLOAD_DIR, MAX_CHAPTERS_PER_STORY, StoryJson } from './seed.config';

function parseChapterFile(
  filePath: string,
): { title: string; content: string } | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8').trim();
    const newline = raw.indexOf('\n');
    if (newline === -1) return null;
    return {
      title: raw.substring(0, newline).trim(),
      content: raw.substring(newline + 1).trim(),
    };
  } catch {
    return null;
  }
}

function getStoryUploadFolder(storyId: string, slug: string): string | null {
  const fullPath = path.join(UPLOAD_DIR, `${storyId}_${slug}`);
  return fs.existsSync(fullPath) ? fullPath : null;
}

function getChapterFiles(folderPath: string): string[] {
  return fs
    .readdirSync(folderPath)
    .filter((f) => f.match(/^\d{5}_\d+\.txt$/) && !f.startsWith('00000_'))
    .sort()
    .slice(0, MAX_CHAPTERS_PER_STORY)
    .map((f) => path.join(folderPath, f));
}

export async function seedNovels(
  ds: DataSource,
  data: StoryJson[],
  categoryMap: Map<string, Category>,
  tagMap: Map<string, Tag>,
  userMap: Map<string, User>,
): Promise<Map<string, Novel>> {
  const novelRepo = ds.getRepository(Novel);
  const novelCategoryRepo = ds.getRepository(NovelCategory);
  const novelTagRepo = ds.getRepository(NovelTag);
  const chapterRepo = ds.getRepository(Chapter);
  const map = new Map<string, Novel>();

  let novelCount = 0;
  let chapterCount = 0;

  for (const d of data) {
    let novel = await novelRepo.findOne({ where: { slug: d.slug } });

    if (!novel) {
      const folderPath = getStoryUploadFolder(d.id, d.slug);
      const poster = folderPath
        ? path.join(folderPath, '00000_poster.jpg')
        : '';

      novel = await novelRepo.save(
        novelRepo.create({
          name: d.name,
          slug: d.slug,
          author: d.author,
          description: d.description,
          poster,
          status: d.status === 'COMPLETED' ? Status.COMPLETED : Status.PENDING,
          vip: d.vip,
          chapterCount: d.chapterCount,
          nominations: d.nominations,
          rating: d.rating,
          ratingCount: d.ratingCount,
          commentCount: d.commentCount,
          postedBy: userMap.get(d.postedBy),
        }),
      );

      for (const catName of d.categories) {
        const cat = categoryMap.get(catName);
        if (cat)
          await novelCategoryRepo.save(
            novelCategoryRepo.create({ novel, category: cat }),
          );
      }

      for (const tagName of d.tags.filter((t) => t !== '—')) {
        const tag = tagMap.get(tagName);
        if (tag) await novelTagRepo.save(novelTagRepo.create({ novel, tag }));
      }

      if (folderPath) {
        const files = getChapterFiles(folderPath);
        for (let i = 0; i < files.length; i++) {
          const parsed = parseChapterFile(files[i]);
          if (!parsed) continue;
          await chapterRepo.save(
            chapterRepo.create({
              novel,
              number: i + 1,
              title: parsed.title,
              content: parsed.content,
              wordCount: parsed.content.split(/\s+/).length,
            }),
          );
          chapterCount++;
        }
      }

      novelCount++;
      console.log(`  📖 ${d.name}`);
    }

    map.set(novel.id, novel);
  }

  console.log(`\n📖 Novels: ${novelCount} mới, ${chapterCount} chapters`);
  return map;
}
