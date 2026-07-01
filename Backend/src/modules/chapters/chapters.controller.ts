import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ChaptersService } from './chapters.service';

@Controller('novels/:slug/chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  // [GET] /api/v1/novels/:slug/chapters?page=1&limit=30
  @Get()
  findAll(
    @Param('slug') slug: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.chaptersService.findByNovel(slug, page, limit);
  }
}
