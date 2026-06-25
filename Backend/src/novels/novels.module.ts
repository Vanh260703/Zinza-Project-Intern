import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from 'src/comments/comments.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { NovelsService } from './novels.service';
import { NovelsController } from './novels.controller';
import { Novel } from './entities/novel.entity';
import { NovelNomination } from './entities/novel-nomination.entity';
import { NovelRating } from './entities/novel-rating.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Novel, NovelNomination, NovelRating, User]),
    CommentsModule,
    CloudinaryModule,
    PaymentsModule,
  ],
  controllers: [NovelsController],
  providers: [NovelsService],
  exports: [NovelsService],
})
export class NovelsModule {}
