import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Category } from 'src/modules/categories/entities/category.entity';
import { Tag } from 'src/modules/tags/entities/tag.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { UserWallet } from 'src/modules/payments/entities/user-wallet.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';
import { NovelCategory } from 'src/modules/novels/entities/novel-category.entity';
import { NovelTag } from 'src/modules/novels/entities/novel-tag.entity';
import { NovelRating } from 'src/modules/novels/entities/novel-rating.entity';
import { Chapter } from 'src/modules/chapters/entities/chapter.entity';

dotenv.config();

export const UPLOAD_DIR = path.resolve(
  __dirname,
  '../../../../Frontend/upload',
);
export const STORIES_JSON = path.resolve(
  __dirname,
  '../../../../Frontend/src/lib/data/stories.json',
);
export const MAX_CHAPTERS_PER_STORY = 10;
export const SEED_PASSWORD = 'Seed@123456';

export type StoryJson = {
  id: string;
  slug: string;
  name: string;
  posterUrl: string;
  status: string;
  chapterCount: number;
  rating: number;
  ratingCount: number;
  commentCount: number;
  nominations: number;
  author: string;
  postedBy: string;
  categories: string[];
  tags: string[];
  description: string;
  vip: boolean;
};

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    Category,
    Tag,
    User,
    UserWallet,
    Novel,
    NovelCategory,
    NovelTag,
    NovelRating,
    Chapter,
  ],
  synchronize: false,
});
