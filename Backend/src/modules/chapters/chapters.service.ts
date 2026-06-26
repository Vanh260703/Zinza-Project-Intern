import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from './entities/chapter.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(Novel)
    private readonly novelRepository: Repository<Novel>,
  ) {}

  async findByNovel(slug: string, page: number = 1, limit: number = 30) {
    const novel = await this.novelRepository.findOneBy({ slug });
    if (!novel) throw new NotFoundException('Truyện không tồn tại');

    const [chapters, total] = await this.chapterRepository.findAndCount({
      where: { novel: { id: novel.id } },
      select: { id: true, number: true, title: true },
      order: { number: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: chapters,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
