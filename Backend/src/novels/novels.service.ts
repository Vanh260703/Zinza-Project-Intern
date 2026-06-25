import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Novel } from './entities/novel.entity';
import { NovelNomination } from './entities/novel-nomination.entity';
import { NovelRating } from './entities/novel-rating.entity';
import { User } from 'src/users/entities/user.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { QueryNovelsDto } from './dto/query-novels.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { SortOrder } from './enums';

@Injectable()
export class NovelsService {
  constructor(
    @InjectRepository(Novel)
    private readonly novelRepository: Repository<Novel>,
    @InjectRepository(NovelNomination)
    private readonly nominationRepository: Repository<NovelNomination>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(NovelRating)
    private readonly ratingRepository: Repository<NovelRating>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(dto: QueryNovelsDto) {
    const { q, category, sort, status, page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;

    const qb = this.baseQuery();

    if (q) {
      const slugQ = q.trim().toLowerCase().replace(/\s+/g, '-');
      qb.where(
        '(novel.name ILIKE :nameQ OR novel.slug ILIKE :slugQ OR novel.author ILIKE :nameQ)',
        { nameQ: `%${q}%`, slugQ: `%${slugQ}%` },
      );
    }

    if (category) {
      qb.andWhere('category.slug = :category', { category });
    }

    if (status) {
      qb.andWhere('novel.status = :status', { status });
    }

    switch (sort) {
      case SortOrder.RATING:
        qb.orderBy('novel.rating', 'DESC');
        break;
      case SortOrder.NOMINATIONS:
        qb.orderBy('novel.nominations', 'DESC');
        break;
      case SortOrder.NEWEST:
      default:
        qb.orderBy('novel.createdAt', 'DESC');
    }

    const [novels, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data: novels.map(this.toResponse),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(slug: string) {
    const novel = await this.baseQuery()
      .leftJoinAndSelect('novel.postedBy', 'postedBy')
      .where('novel.slug = :slug', { slug })
      .getOne();

    if (!novel) throw new NotFoundException('Truyện không tồn tại');

    return {
      id: novel.id,
      slug: novel.slug,
      name: novel.name,
      author: novel.author,
      poster: novel.poster,
      description: novel.description,
      status: novel.status,
      vip: novel.vip,
      candyReceived: novel.candyReceived,
      chapterCount: novel.chapterCount,
      rating: novel.rating,
      ratingCount: novel.ratingCount,
      nominations: novel.nominations,
      commentCount: novel.commentCount,
      categories: novel.novelCategories?.map((nc) => nc.category.name) ?? [],
      tags: novel.novelTags?.map((nt) => nt.tag.name) ?? [],
      postedBy: novel.postedBy
        ? { id: novel.postedBy.id, name: novel.postedBy.name }
        : null,
      createdAt: novel.createdAt,
      updatedAt: novel.updatedAt,
    };
  }

  async findOneEntity(slug: string): Promise<Novel> {
    const novel = await this.novelRepository.findOne({
      where: { slug },
      relations: { postedBy: true },
    });
    if (!novel) throw new NotFoundException('Truyện không tồn tại');
    return novel;
  }

  async updateCover(
    userId: string,
    slug: string,
    file: Express.Multer.File,
  ): Promise<{ poster: string }> {
    const novel = await this.findOneEntity(slug);
    if (novel.postedBy?.id !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa truyện này');
    }

    const result = await this.cloudinaryService.uploadStream(
      file.buffer,
      'novels/covers',
      novel.slug,
    );

    await this.novelRepository.update(novel.id, { poster: result.secure_url });
    return { poster: result.secure_url };
  }

  async getRatings(slug: string, page: number = 1, limit: number = 5) {
    const skip = (page - 1) * limit;

    const novel = await this.novelRepository.findOne({ where: { slug } });
    if (!novel) throw new NotFoundException('Truyện không tồn tại');

    const [ratings, total] = await this.ratingRepository.findAndCount({
      where: { novel: { id: novel.id } },
      relations: { user: true },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: ratings.map((r) => ({
        id: r.id,
        rating: r.rating,
        review: r.review ?? null,
        createdAt: r.createdAt,
        user: {
          id: r.user.id,
          name: r.user.name,
          avatarUrl: r.user.avatarUrl ?? null,
        },
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createRating(userId: string, slug: string, dto: CreateRatingDto) {
    const novel = await this.novelRepository.findOne({ where: { slug } });
    if (!novel) throw new NotFoundException('Truyện không tồn tại');

    const alreadyRated = await this.ratingRepository.existsBy({
      user: { id: userId },
      novel: { id: novel.id },
    });
    if (alreadyRated)
      throw new ConflictException('Bạn đã đánh giá truyện này rồi');

    await this.ratingRepository.save(
      this.ratingRepository.create({
        user: { id: userId },
        novel: { id: novel.id },
        rating: dto.rating,
        review: dto.review,
      }),
    );

    const raw = await this.ratingRepository
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('r.novel', 'n')
      .where('n.id = :novelId', { novelId: novel.id })
      .getRawOne<{ avg: string; count: string }>();

    await this.novelRepository.update(novel.id, {
      rating: raw ? Math.round(parseFloat(raw.avg) * 100) / 100 : dto.rating,
      ratingCount: raw ? parseInt(raw.count) : 1,
    });

    return { message: 'Đánh giá thành công' };
  }

  async updateRating(userId: string, slug: string, dto: UpdateRatingDto) {
    const novel = await this.novelRepository.findOne({ where: { slug } });
    if (!novel) throw new NotFoundException('Truyện không tồn tại');

    const rating = await this.ratingRepository.findOne({
      where: { user: { id: userId }, novel: { id: novel.id } },
    });
    if (!rating) throw new NotFoundException('Bạn chưa đánh giá truyện này');

    await this.ratingRepository.update(rating.id, {
      ...(dto.rating !== undefined && { rating: dto.rating }),
      ...(dto.review !== undefined && { review: dto.review }),
    });

    const raw = await this.ratingRepository
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('r.novel', 'n')
      .where('n.id = :novelId', { novelId: novel.id })
      .getRawOne<{ avg: string; count: string }>();

    if (raw) {
      await this.novelRepository.update(novel.id, {
        rating: Math.round(parseFloat(raw.avg) * 100) / 100,
        ratingCount: parseInt(raw.count),
      });
    }

    return { message: 'Cập nhật đánh giá thành công' };
  }

  async deleteRating(userId: string, slug: string) {
    const novel = await this.novelRepository.findOne({ where: { slug } });
    if (!novel) throw new NotFoundException('Truyện không tồn tại');

    const rating = await this.ratingRepository.findOne({
      where: { user: { id: userId }, novel: { id: novel.id } },
    });
    if (!rating) throw new NotFoundException('Bạn chưa đánh giá truyện này');

    await this.ratingRepository.delete(rating.id);

    const raw = await this.ratingRepository
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('r.novel', 'n')
      .where('n.id = :novelId', { novelId: novel.id })
      .getRawOne<{ avg: string; count: string }>();

    await this.novelRepository.update(novel.id, {
      rating: raw ? Math.round(parseFloat(raw.avg) * 100) / 100 : 0,
      ratingCount: raw ? parseInt(raw.count) : 0,
    });

    return { message: 'Xoá đánh giá thành công' };
  }

  async nominate(
    userId: string,
    slug: string,
  ): Promise<{ message: string; remainingTickets: number }> {
    const novel = await this.novelRepository.findOne({ where: { slug } });
    if (!novel) throw new NotFoundException('Truyện không tồn tại');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    if (user.recommendationTicket < 1) {
      throw new BadRequestException('Không đủ vé đề cử');
    }

    await this.userRepository.decrement(
      { id: userId },
      'recommendationTicket',
      1,
    );
    await this.nominationRepository.save(
      this.nominationRepository.create({
        user: { id: userId },
        novel: { id: novel.id },
      }),
    );
    await this.novelRepository.increment({ id: novel.id }, 'nominations', 1);

    return {
      message: 'Đề cử thành công',
      remainingTickets: user.recommendationTicket - 1,
    };
  }

  private baseQuery(): SelectQueryBuilder<Novel> {
    return this.novelRepository
      .createQueryBuilder('novel')
      .leftJoinAndSelect('novel.novelCategories', 'nc')
      .leftJoinAndSelect('nc.category', 'category')
      .leftJoinAndSelect('novel.novelTags', 'nt')
      .leftJoinAndSelect('nt.tag', 'tag');
  }

  private readonly toResponse = (novel: Novel) => ({
    id: novel.id,
    slug: novel.slug,
    name: novel.name,
    author: novel.author,
    poster: novel.poster,
    status: novel.status,
    chapterCount: novel.chapterCount,
    rating: novel.rating,
    nominations: novel.nominations,
    vip: novel.vip,
    categories: novel.novelCategories?.map((nc) => nc.category.name) ?? [],
    tags: novel.novelTags?.map((nt) => nt.tag.name) ?? [],
    updatedAt: novel.updatedAt,
  });
}
