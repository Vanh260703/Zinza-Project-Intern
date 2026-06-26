import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository, SelectQueryBuilder } from 'typeorm';
import AdmZip from 'adm-zip';
import { Novel } from './entities/novel.entity';
import { NovelNomination } from './entities/novel-nomination.entity';
import { NovelRating } from './entities/novel-rating.entity';
import { NovelCategory } from './entities/novel-category.entity';
import { NovelTag } from './entities/novel-tag.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { Tag } from 'src/modules/tags/entities/tag.entity';
import { Chapter } from 'src/modules/chapters/entities/chapter.entity';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';
import { generateSlug } from 'src/shared/utils/slug.util';
import { parseOverview } from './utils/parse-overview';
import { QueryNovelsDto } from './dto/query-novels.dto';
import { CreateNovelDto } from './dto/create-novel.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { SortOrder, Status } from './enums';

@Injectable()
export class NovelsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Novel)
    private readonly novelRepository: Repository<Novel>,
    @InjectRepository(NovelNomination)
    private readonly nominationRepository: Repository<NovelNomination>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(NovelRating)
    private readonly ratingRepository: Repository<NovelRating>,

    @InjectRepository(NovelTag)
    private readonly novelTagRepository: Repository<NovelTag>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    userId: string,
    dto: CreateNovelDto,
    file?: Express.Multer.File,
  ) {
    const slug = generateSlug(dto.name);
    const exists = await this.novelRepository.existsBy({ slug });
    if (exists) throw new ConflictException('Truyện với tên này đã tồn tại');

    const categories = await this.categoryRepository.findBy({
      id: In(dto.categories),
    });
    if (categories.length !== dto.categories.length) {
      throw new BadRequestException('Một hoặc nhiều thể loại không tồn tại');
    }

    const novel = await this.dataSource.transaction(async (em) => {
      const saved = await em.save(
        em.create(Novel, {
          name: dto.name,
          slug,
          author: dto.author,
          description: dto.description ?? null,
          status: dto.status,
          postedBy: { id: userId },
        }),
      );
      if (categories.length > 0) {
        await em.insert(
          NovelCategory,
          categories.map((cat) => ({ novel: saved, category: cat })),
        );
      }
      return saved;
    });

    if (file) {
      const result = await this.cloudinaryService.uploadStream(
        file.buffer,
        'novels',
        novel.slug,
      );
      await this.novelRepository.update(novel.id, {
        poster: result.secure_url,
      });
      novel.poster = result.secure_url;
    }

    return {
      id: novel.id,
      slug: novel.slug,
      name: novel.name,
      author: novel.author,
      poster: novel.poster ?? null,
      status: novel.status,
      categories: categories.map((c) => c.name),
    };
  }

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
      'novels',
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

  async importFromZip(userId: string, file: Express.Multer.File) {
    let zip: AdmZip;
    try {
      zip = new AdmZip(file.buffer);
    } catch {
      throw new BadRequestException(
        'File không hợp lệ, phải là định dạng .zip',
      );
    }

    const entries = zip.getEntries();

    // Tìm overview entry (có thể nằm trong subfolder hoặc root)
    const overviewEntry = entries.find((e) =>
      e.entryName.endsWith('00000_overview.txt'),
    );
    if (!overviewEntry) {
      throw new BadRequestException('Thiếu file 00000_overview.txt trong zip');
    }

    // Xác định prefix folder (nếu có subfolder thì bóc ra)
    const prefix = overviewEntry.entryName.replace('00000_overview.txt', '');

    // Parse overview
    const overview = parseOverview(overviewEntry.getData().toString('utf-8'));
    if (!overview.name) {
      throw new BadRequestException('overview.txt thiếu trường "Tên truyện"');
    }
    if (!overview.author) {
      throw new BadRequestException('overview.txt thiếu trường "Tác giả"');
    }

    // Tìm các file chương: {prefix}00001_*.txt, 00002_*.txt, ...
    const chapterEntries = entries
      .filter((e) => {
        const name = e.entryName.slice(prefix.length);
        return /^\d{5}_\d+\.txt$/.test(name) && !name.startsWith('00000_');
      })
      .sort((a, b) => a.entryName.localeCompare(b.entryName));

    if (chapterEntries.length === 0) {
      throw new BadRequestException(
        'Không tìm thấy file chương nào (định dạng: 00001_*.txt)',
      );
    }

    // Lookup categories, tự động tạo nếu chưa tồn tại
    const categories: Category[] = [];
    for (const name of overview.categories) {
      let cat = await this.categoryRepository.findOneBy({ name });
      if (!cat) {
        cat = await this.categoryRepository.save(
          this.categoryRepository.create({ name }),
        );
      }
      categories.push(cat);
    }

    // Lookup tags (bỏ qua tag không tồn tại, không throw)
    const tags =
      overview.tags.length > 0
        ? await this.tagRepository.findBy({ name: In(overview.tags) })
        : [];

    // Check slug trùng
    const slug = generateSlug(overview.name);
    const exists = await this.novelRepository.existsBy({ slug });
    if (exists) {
      throw new ConflictException(
        `Truyện "${overview.name}" đã tồn tại trong hệ thống`,
      );
    }

    const statusMap: Record<string, Status> = {
      'hoàn thành': Status.COMPLETED,
      completed: Status.COMPLETED,
    };
    const status = statusMap[overview.status.toLowerCase()] ?? Status.PENDING;

    // Toàn bộ insert trong 1 transaction
    const novel = await this.dataSource.transaction(async (em) => {
      const saved = await em.save(
        em.create(Novel, {
          name: overview.name,
          slug,
          author: overview.author,
          description: overview.description,
          status,
          postedBy: { id: userId },
        }),
      );

      if (categories.length > 0) {
        await em.insert(
          NovelCategory,
          categories.map((cat) => ({ novel: saved, category: cat })),
        );
      }
      if (tags.length > 0) {
        await em.insert(
          NovelTag,
          tags.map((tag) => ({ novel: saved, tag })),
        );
      }

      const chapterRows: Partial<Chapter>[] = [];
      let chapterNumber = 1;
      for (const entry of chapterEntries) {
        const raw = entry.getData().toString('utf-8').trim();
        const nl = raw.indexOf('\n');
        if (nl === -1) continue;
        const title = raw.substring(0, nl).trim();
        const content = raw.substring(nl + 1).trim();
        chapterRows.push({
          novel: saved,
          number: chapterNumber++,
          title,
          content,
          wordCount: content.split(/\s+/).length,
        });
      }

      if (chapterRows.length > 0) {
        await em.insert(Chapter, chapterRows);
      }

      const actualChapterCount = chapterRows.length;
      await em.update(Novel, saved.id, { chapterCount: actualChapterCount });

      return { ...saved, chapterCount: actualChapterCount };
    });

    return {
      id: novel.id,
      slug: novel.slug,
      name: novel.name,
      author: novel.author,
      status: novel.status,
      chapterCount: novel.chapterCount,
      categories: categories.map((c) => c.name),
      tags: tags.map((t) => t.name),
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
