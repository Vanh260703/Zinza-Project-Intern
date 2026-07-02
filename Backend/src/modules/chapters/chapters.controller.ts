import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { JwtAuthGuard, OptionalJwtGuard } from 'src/shared/guards';
import { CurrentUser } from 'src/shared/decorators';
import { User } from 'src/modules/users/entities/user.entity';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';

@Controller('novels/:slug/chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  // [POST] /api/v1/novels/:slug/chapters
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createChapter(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Body() dto: CreateChapterDto,
  ) {
    return this.chaptersService.createChapter(user.id, slug, dto);
  }

  // [PATCH] /api/v1/novels/:slug/chapters/:id
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateChapter(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChapterDto,
  ) {
    return this.chaptersService.updateChapter(user.id, slug, id, dto);
  }

  // [DELETE] /api/v1/novels/:slug/chapters/:id
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteChapter(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.chaptersService.deleteChapter(user.id, slug, id);
    return { message: 'Xoá chương thành công' };
  }

  // [POST] /api/v1/novels/:slug/chapters/:id/unlock
  @UseGuards(JwtAuthGuard)
  @Post(':id/unlock')
  @HttpCode(HttpStatus.OK)
  unlockChapter(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chaptersService.unlockChapter(user.id, slug, id);
  }

  // [GET] /api/v1/novels/:slug/chapters/:id
  @UseGuards(OptionalJwtGuard)
  @Get(':id')
  findOne(
    @Param('slug') slug: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: User,
  ) {
    return this.chaptersService.findOne(slug, id, user?.id ?? null);
  }

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
