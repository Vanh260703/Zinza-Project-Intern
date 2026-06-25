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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NovelsService } from './novels.service';
import { PaymentsService } from 'src/payments/payments.service';
import { CommentsService } from 'src/comments/comments.service';
import { CommentTargetType } from 'src/comments/enums/comment-target-type.enum';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { UpdateCommentDto } from 'src/comments/dto/update-comment.dto';
import { QueryNovelsDto } from './dto/query-novels.dto';
import { GiftCandyDto } from './dto/gift-candy.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtAuthGuard } from 'src/common/guards';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/users/entities/user.entity';

@Controller('novels')
export class NovelsController {
  constructor(
    private readonly novelsService: NovelsService,
    private readonly paymentsService: PaymentsService,
    private readonly commentsService: CommentsService,
  ) {}

  // [GET] /api/v1/novels?q=muc+than+ky&category=huyen-huyen&sort=newest&status=COMPLETED
  @Get()
  findAll(@Query() dto: QueryNovelsDto) {
    return this.novelsService.findAll(dto);
  }

  // [GET] /api/v1/novels/:slug
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.novelsService.findOne(slug);
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
    return this.paymentsService.giftCandy(user.id, novel, dto.amount);
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
    const novel = await this.novelsService.findOneEntity(slug);
    return { poster: novel.poster };
  }

  // [POST] /api/v1/novels/:slug/cover
  @UseGuards(JwtAuthGuard)
  @Post(':slug/cover')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  uploadCover(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @UploadedFile() file: Express.Multer.File,
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
