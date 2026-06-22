import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Category } from 'src/categories/entities/category.entity';
import { Tag } from 'src/tags/entities/tag.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Category, Tag],
  synchronize: false,
});

const CATEGORIES = [
  'Tiên Hiệp',
  'Huyền Huyễn',
  'Võ Hiệp',
  'Kiếm Hiệp',
  'Đô Thị',
  'Dị Giới',
  'Khoa Huyễn',
  'Lịch Sử',
  'Hệ Thống',
  'Ngôn Tình',
  'Trinh Thám',
  'Kinh Dị',
];

const TAGS = [
  'Xuyên Không',
  'Trọng Sinh',
  'Bá Đạo Nam Chính',
  'Nữ Cường',
  'Ngọt Sủng',
  'Hài Hước',
  'Cung Đấu',
  'Mạt Thế',
  'Happy Ending',
  'Bad Ending',
  'Cổ Đại',
  'Hiện Đại',
  'Kỳ Huyễn',
  'Vô Địch Chủ Nhân Công',
  'Nhanh Xuyên',
];

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Kết nối database thành công');

  const categoryRepo = AppDataSource.getRepository(Category);
  const tagRepo = AppDataSource.getRepository(Tag);

  // Seed categories
  let categoryCount = 0;
  for (const name of CATEGORIES) {
    const exists = await categoryRepo.findOne({ where: { name } });
    if (!exists) {
      const category = categoryRepo.create({ name });
      await categoryRepo.save(category); // BeforeInsert tự generate slug
      categoryCount++;
    }
  }
  console.log(`📚 Categories: đã thêm ${categoryCount}/${CATEGORIES.length}`);

  // Seed tags
  let tagCount = 0;
  for (const name of TAGS) {
    const exists = await tagRepo.findOne({ where: { name } });
    if (!exists) {
      const tag = tagRepo.create({ name });
      await tagRepo.save(tag); // BeforeInsert tự generate slug
      tagCount++;
    }
  }
  console.log(`🏷️  Tags: đã thêm ${tagCount}/${TAGS.length}`);

  await AppDataSource.destroy();
  console.log('✅ Seed hoàn tất');
}

seed().catch((err) => {
  console.error('❌ Seed thất bại:', err);
  process.exit(1);
});
