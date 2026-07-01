import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { Chapter } from './entities/chapter.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chapter, Novel])],
  controllers: [ChaptersController],
  providers: [ChaptersService],
  exports: [ChaptersService],
})
export class ChaptersModule {}
