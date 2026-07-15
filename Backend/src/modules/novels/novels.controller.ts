import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { NovelsService } from './novels.service';
import { NOVEL_IMPORT_QUEUE } from './novel-import.processor';
import { PaymentsService } from 'src/modules/payments/payments.service';
import { CommentsService } from 'src/modules/comments/comments.service';
import { CommentTargetType } from 'src/modules/comments/enums/comment-target-type.enum';
import { CreateCommentDto } from 'src/modules/comments/dto/create-comment.dto';
import { UpdateCommentDto } from 'src/modules/comments/dto/update-comment.dto';
import { QueryNovelsDto } from './dto/query-novels.dto';
import { GiftCandyDto } from './dto/gift-candy.dto';
import { CreateNovelDto } from './dto/create-novel.dto';
import { UpdateNovelDto } from './dto/update-novel.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtAuthGuard } from 'src/shared/guards';
import { CurrentUser } from 'src/shared/decorators';
import { User } from 'src/modules/users/entities/user.entity';

@Controller('novels')
export class NovelsController {
  constructor(
    private readonly novelsService: NovelsService,
    private readonly paymentsService: PaymentsService,
    private readonly commentsService: CommentsService,
    @InjectQueue(NOVEL_IMPORT_QUEUE) private readonly importQueue: Queue,
  ) {}

  // [GET] /api/v1/novels?q=muc+than+ky&category=huyen-huyen&sort=newest&status=COMPLETED
  @Get()
  findAll(@Query() dto: QueryNovelsDto) {
    return this.novelsService.findAll(dto);
  }

  // [POST] /api/v1/novels
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('cover'))
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateNovelDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp)/ }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.novelsService.create(user.id, dto, file);
  }

  // [POST] /api/v1/novels/import
  @UseGuards(JwtAuthGuard)
  @Post('import')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor('file'))
  async import(
    @CurrentUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const tempPath = path.join(
      os.tmpdir(),
      `novel-import-${user.id}-${Date.now()}.zip`,
    );
    fs.writeFileSync(tempPath, file.buffer);
    try {
      const job = await this.importQueue.add('import', {
        userId: user.id,
        filePath: tempPath,
      });
      return { jobId: job.id, message: 'Import đang được xử lý trong nền' };
    } catch (err) {
      fs.unlink(tempPath, () => {});
      throw err;
    }
  }

  // [GET] /api/v1/novels/import/jobs/:jobId
  @UseGuards(JwtAuthGuard)
  @Get('import/jobs/:jobId')
  async getImportStatus(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
  ) {
    const job = await this.importQueue.getJob(jobId);
    if (!job) throw new NotFoundException('Job không tồn tại');
    if (job.data.userId !== user.id)
      throw new NotFoundException('Job không tồn tại');
    const state = await job.getState();
    return {
      jobId: job.id,
      state, // 'waiting' | 'active' | 'completed' | 'failed'
      result: state === 'completed' ? job.returnvalue : undefined,
      error: state === 'failed' ? job.failedReason : undefined,
    };
  }

  // [GET] /api/v1/novels/random — 1 truyện ngẫu nhiên (rating ≥ 4.5, fallback bất kỳ)
  // Đặt TRƯỚC :slug để route param không nuốt mất
  @Get('random')
  findRandom() {
    return this.novelsService.findRandom();
  }

  // [GET] /api/v1/novels/rankings — BXH ngày/tuần/tháng theo lượt đọc
  @Get('rankings')
  getRankings() {
    return this.novelsService.getRankingsAll();
  }

  // [GET] /api/v1/novels/:slug
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.novelsService.findOne(slug);
  }

  // [PATCH] /api/v1/novels/:slug — sửa truyện (chỉ người đăng)
  @UseGuards(JwtAuthGuard)
  @Patch(':slug')
  update(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Body() dto: UpdateNovelDto,
  ) {
    return this.novelsService.update(user.id, slug, dto);
  }

  // [DELETE] /api/v1/novels/:slug — xoá truyện (chỉ người đăng)
  @UseGuards(JwtAuthGuard)
  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: User, @Param('slug') slug: string) {
    await this.novelsService.remove(user.id, slug);
    return { message: 'Xoá truyện thành công' };
  }

  // [POST] /api/v1/novels/:slug/nominate
  @UseGuards(JwtAuthGuard)
  @Post(':slug/nominate')
  @HttpCode(HttpStatus.OK)
  nominate(@CurrentUser() user: User, @Param('slug') slug: string) {
    return this.novelsService.nominate(user.id, slug);
  }

  // [POST] /api/v1/novels/:slug/gift-candy
  @UseGuards(JwtAuthGuard)
  @Post(':slug/gift-candy')
  @HttpCode(HttpStatus.OK)
  async giftCandy(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Body() dto: GiftCandyDto,
  ) {
    const novel = await this.novelsService.findOneEntity(slug);
    return this.paymentsService.giftCandy(
      user.id,
      novel,
      dto.amount,
      user.name,
    );
  }

  // [GET] /api/v1/novels/:slug/ratings?page=1&limit=5
  @Get(':slug/ratings')
  getRatings(
    @Param('slug') slug: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.novelsService.getRatings(slug, page, limit);
  }

  // [POST] /api/v1/novels/:slug/ratings
  @UseGuards(JwtAuthGuard)
  @Post(':slug/ratings')
  @HttpCode(HttpStatus.OK)
  createRating(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Body() dto: CreateRatingDto,
  ) {
    return this.novelsService.createRating(user.id, slug, dto);
  }

  // [PATCH] /api/v1/novels/:slug/ratings
  @UseGuards(JwtAuthGuard)
  @Patch(':slug/ratings')
  @HttpCode(HttpStatus.OK)
  updateRating(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Body() dto: UpdateRatingDto,
  ) {
    return this.novelsService.updateRating(user.id, slug, dto);
  }

  // [DELETE] /api/v1/novels/:slug/ratings
  @UseGuards(JwtAuthGuard)
  @Delete(':slug/ratings')
  @HttpCode(HttpStatus.OK)
  deleteRating(@CurrentUser() user: User, @Param('slug') slug: string) {
    return this.novelsService.deleteRating(user.id, slug);
  }

  // [GET] /api/v1/novels/:slug/cover
  @Get(':slug/cover')
  async getCover(@Param('slug') slug: string) {
    const novel = await this.novelsService.findOne(slug);
    return { poster: novel.poster };
  }

  // [POST] /api/v1/novels/:slug/cover
  @UseGuards(JwtAuthGuard)
  @Post(':slug/cover')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('cover'))
  uploadCover(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.novelsService.updateCover(user.id, slug, file);
  }

  // [GET] /api/v1/novels/:slug/comments?page=1&limit=10
  @Get(':slug/comments')
  async getComments(
    @Param('slug') slug: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const novel = await this.novelsService.findOne(slug);
    return this.commentsService.findByTarget(
      CommentTargetType.NOVEL,
      novel.id,
      page,
      limit,
    );
  }

  // [POST] /api/v1/novels/:slug/comments
  @UseGuards(JwtAuthGuard)
  @Post(':slug/comments')
  @HttpCode(HttpStatus.OK)
  async createComment(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Body() dto: CreateCommentDto,
  ) {
    const novel = await this.novelsService.findOne(slug);
    return this.commentsService.createForTarget(
      user.id,
      CommentTargetType.NOVEL,
      novel.id,
      dto,
    );
  }

  // [PATCH] /api/v1/novels/:slug/comments/:id
  @UseGuards(JwtAuthGuard)
  @Patch(':slug/comments/:id')
  @HttpCode(HttpStatus.OK)
  updateComment(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(user.id, id, dto);
  }

  // [DELETE] /api/v1/novels/:slug/comments/:id
  @UseGuards(JwtAuthGuard)
  @Delete(':slug/comments/:id')
  @HttpCode(HttpStatus.OK)
  removeComment(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.commentsService.remove(user.id, id);
  }
}
