import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { Chapter } from './entities/chapter.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';
import { ChapterPurchase } from 'src/modules/payments/entities/chapter-purchase.entity';
import { UserWallet } from 'src/modules/payments/entities/user-wallet.entity';
import { WalletTransaction } from 'src/modules/payments/entities/wallet-transaction.entity';
import { TransactionType } from 'src/modules/payments/enums/transaction-type.enum';
import { UserNovelBookMark } from 'src/modules/users/entities/user-novel-bookmark.entity';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { NotificationType } from 'src/modules/notifications/enums/notification-type.enum';

@Injectable()
export class ChaptersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(Novel)
    private readonly novelRepository: Repository<Novel>,
    @InjectRepository(UserNovelBookMark)
    private readonly bookmarkRepository: Repository<UserNovelBookMark>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async unlockChapter(
    userId: string | null,
    slug: string,
    chapterId: string,
  ): Promise<{ message: string; remainingBalance: number }> {
    if (!userId)
      throw new BadRequestException('Bạn cần đăng nhập để mở khoá chương');

    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId, novel: { slug } },
      relations: { novel: { postedBy: true } },
    });
    if (!chapter) throw new NotFoundException('Chương không tồn tại');
    if (chapter.price === 0)
      throw new BadRequestException('Chương này miễn phí, không cần mở khoá');
    if (chapter.novel.postedBy?.id === userId)
      throw new BadRequestException(
        'Bạn là tác giả, không cần mở khoá chương của chính mình',
      );

    return this.dataSource.transaction(async (em) => {
      // Lock wallet để tránh race condition
      const wallet = await em.findOne(UserWallet, {
        where: { user: { id: userId } },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) throw new NotFoundException('Ví không tồn tại');

      // Check đã mua chưa
      const alreadyPurchased = await em.existsBy(ChapterPurchase, {
        user: { id: userId },
        chapter: { id: chapterId },
      });
      if (alreadyPurchased)
        throw new BadRequestException('Bạn đã mở khoá chương này rồi');

      if (wallet.balance < chapter.price) {
        throw new BadRequestException(
          `Số dư không đủ (cần ${chapter.price}, hiện có ${wallet.balance})`,
        );
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore - chapter.price;

      await em.update(UserWallet, wallet.id, {
        balance: balanceAfter,
        totalSpent: wallet.totalSpent + chapter.price,
      });

      const purchase = await em.save(
        em.create(ChapterPurchase, {
          user: { id: userId },
          chapter: { id: chapterId },
          novel: { id: chapter.novel.id },
          candySpent: chapter.price,
        }),
      );

      await em.save(
        em.create(WalletTransaction, {
          user: { id: userId },
          type: TransactionType.SPEND,
          amount: -chapter.price,
          balanceBefore,
          balanceAfter,
          referenceType: 'chapter_purchase',
          referenceId: purchase.id,
          description: `Mở khoá Chương ${chapter.number} - ${chapter.novel.name}`,
        }),
      );

      // Chỉ số kẹo truyện nhận được
      await em.increment(
        Novel,
        { id: chapter.novel.id },
        'candyReceived',
        chapter.price,
      );

      // Cộng kẹo vào ví người đăng truyện
      // Lock ví người nhận để balanceBefore/After ghi vào lịch sử luôn khớp thứ tự khi có nhiều giao dịch cộng dồn
      const authorWallet = chapter.novel.postedBy
        ? await em.findOne(UserWallet, {
            where: { user: { id: chapter.novel.postedBy.id } },
            lock: { mode: 'pessimistic_write' },
          })
        : null;
      if (chapter.novel.postedBy && authorWallet) {
        const authorBalanceBefore = authorWallet.balance;
        const authorBalanceAfter = authorBalanceBefore + chapter.price;
        await em.update(UserWallet, authorWallet.id, {
          balance: authorBalanceAfter,
        });
        await em.save(
          em.create(WalletTransaction, {
            user: { id: chapter.novel.postedBy.id },
            type: TransactionType.EARN,
            amount: chapter.price,
            balanceBefore: authorBalanceBefore,
            balanceAfter: authorBalanceAfter,
            referenceType: 'chapter',
            referenceId: chapterId,
            description: `Nhận ${chapter.price} kẹo từ mở khoá chương "${chapter.title}"`,
          }),
        );
      }

      return { message: 'Mở khoá thành công', remainingBalance: balanceAfter };
    });
  }

  async findOne(
    slug: string,
    id: string,
    userId: string | null,
  ): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({
      where: { id, novel: { slug } },
      relations: { novel: { postedBy: true } },
      select: {
        id: true,
        number: true,
        title: true,
        content: true,
        wordCount: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        novel: {
          id: true,
          name: true,
          postedBy: { id: true, name: true },
        },
      },
    });
    if (!chapter) throw new NotFoundException('Chương không tồn tại');

    if (chapter.price > 0) {
      const isOwner = chapter.novel.postedBy?.id === userId;
      const hasPurchased =
        userId !== null &&
        (await this.dataSource.manager.existsBy(ChapterPurchase, {
          user: { id: userId },
          chapter: { id },
        }));

      if (!isOwner && !hasPurchased) {
        chapter.content = '';
      }
    }

    return chapter;
  }

  private async getNovelOwnedBy(slug: string, userId: string): Promise<Novel> {
    const novel = await this.novelRepository.findOneBy({
      slug,
      postedBy: { id: userId },
    });
    if (!novel)
      throw new ForbiddenException(
        'Truyện không tồn tại hoặc bạn không có quyền chỉnh sửa',
      );
    return novel;
  }

  async createChapter(
    userId: string,
    slug: string,
    dto: CreateChapterDto,
  ): Promise<Chapter> {
    const { chapter, novel } = await this.dataSource.transaction(async (em) => {
      // Pessimistic lock trên novel để serialize concurrent chapter creates
      const novel = await em.findOne(Novel, {
        where: { slug, postedBy: { id: userId } },
        lock: { mode: 'pessimistic_write' },
      });
      if (!novel)
        throw new ForbiddenException(
          'Truyện không tồn tại hoặc bạn không có quyền chỉnh sửa',
        );

      const maxResult = await em
        .createQueryBuilder(Chapter, 'c')
        .select('MAX(c.number)', 'max')
        .where('c.novel_id = :novelId', { novelId: novel.id })
        .getRawOne<{ max: string | null }>();

      const nextNumber = maxResult?.max ? parseInt(maxResult.max) + 1 : 1;
      const trimmed = dto.content.trim();
      const wordCount = trimmed === '' ? 0 : trimmed.split(/\s+/).length;

      const chapter = await em.save(
        em.create(Chapter, {
          novel: { id: novel.id },
          number: nextNumber,
          title: dto.title,
          content: dto.content,
          price: dto.price ?? 0,
          wordCount,
        }),
      );

      await em.increment(Novel, { id: novel.id }, 'chapterCount', 1);

      if ((dto.price ?? 0) > 0 && !novel.vip) {
        await em.update(Novel, novel.id, { vip: true });
      }

      return { chapter, novel };
    });

    // Báo người đang theo dõi (bookmark) truyện — không chặn việc đăng chương
    // nếu bước này lỗi.
    try {
      const bookmarks = await this.bookmarkRepository.find({
        where: { novel: { id: novel.id } },
        relations: { user: true },
        select: { user: { id: true } },
      });

      if (bookmarks.length > 0) {
        await this.notificationsService.createMany(
          bookmarks.map((b) => ({
            userId: b.user.id,
            type: NotificationType.NEW_CHAPTER,
            title: 'Chương mới',
            content: `"${novel.name}" vừa đăng Chương ${chapter.number}: ${chapter.title}`,
            referenceType: 'chapter',
            referenceId: chapter.id,
          })),
        );
      }
    } catch {
      // bỏ qua — chương đã đăng thành công, không chặn vì lỗi thông báo
    }

    return chapter;
  }

  async updateChapter(
    userId: string,
    slug: string,
    id: string,
    dto: UpdateChapterDto,
  ): Promise<Chapter> {
    await this.getNovelOwnedBy(slug, userId);

    const chapter = await this.chapterRepository.findOne({
      where: { id, novel: { slug } },
    });
    if (!chapter) throw new NotFoundException('Chương không tồn tại');

    const updatePayload: Partial<Chapter> = { ...dto };
    if (dto.content !== undefined) {
      const trimmed = dto.content.trim();
      updatePayload.wordCount =
        trimmed === '' ? 0 : trimmed.split(/\s+/).length;
    }

    await this.chapterRepository.update(id, updatePayload);

    if (dto.price !== undefined) {
      const novel = await this.novelRepository.findOneBy({ slug });
      if (novel) {
        if (dto.price > 0 && !novel.vip) {
          await this.novelRepository.update(novel.id, { vip: true });
        } else if (dto.price === 0 && novel.vip) {
          const paidChapterExists = await this.chapterRepository.existsBy({
            novel: { id: novel.id },
            price: MoreThan(0),
          });
          if (!paidChapterExists) {
            await this.novelRepository.update(novel.id, { vip: false });
          }
        }
      }
    }

    return this.chapterRepository.findOneOrFail({ where: { id } });
  }

  async deleteChapter(userId: string, slug: string, id: string): Promise<void> {
    const novel = await this.getNovelOwnedBy(slug, userId);

    const chapter = await this.chapterRepository.findOne({
      where: { id, novel: { slug } },
    });
    if (!chapter) throw new NotFoundException('Chương không tồn tại');

    await this.chapterRepository.delete(id);
    await this.novelRepository.decrement({ id: novel.id }, 'chapterCount', 1);

    if (chapter.price > 0 && novel.vip) {
      const paidChapterExists = await this.chapterRepository.existsBy({
        novel: { id: novel.id },
        price: MoreThan(0),
      });
      if (!paidChapterExists) {
        await this.novelRepository.update(novel.id, { vip: false });
      }
    }
  }

  async findByNovel(slug: string, page: number = 1, limit: number = 30) {
    const novel = await this.novelRepository.findOneBy({ slug });
    if (!novel) throw new NotFoundException('Truyện không tồn tại');

    const [chapters, total] = await this.chapterRepository.findAndCount({
      where: { novel: { id: novel.id } },
      select: {
        id: true,
        number: true,
        title: true,
        price: true,
        wordCount: true,
        createdAt: true,
      },
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
