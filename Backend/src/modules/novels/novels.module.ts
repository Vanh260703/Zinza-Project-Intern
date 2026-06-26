import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from 'src/modules/comments/comments.module';
import { CloudinaryModule } from 'src/shared/cloudinary/cloudinary.module';
import { PaymentsModule } from 'src/modules/payments/payments.module';
import { NovelsService } from './novels.service';
import { NovelsController } from './novels.controller';
import { Novel } from './entities/novel.entity';
import { NovelNomination } from './entities/novel-nomination.entity';
import { NovelRating } from './entities/novel-rating.entity';
import { NovelCategory } from './entities/novel-category.entity';
import { NovelTag } from './entities/novel-tag.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { Tag } from 'src/modules/tags/entities/tag.entity';
import { Chapter } from 'src/modules/chapters/entities/chapter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Novel,
      NovelNomination,
      NovelRating,
      NovelCategory,
      NovelTag,
      User,
      Category,
      Tag,
      Chapter,
    ]),
    CommentsModule,
    CloudinaryModule,
    PaymentsModule,
  ],
  controllers: [NovelsController],
  providers: [NovelsService],
  exports: [NovelsService],
})
export class NovelsModule {}
