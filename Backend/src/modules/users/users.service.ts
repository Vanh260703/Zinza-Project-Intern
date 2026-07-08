import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';
import { UserWallet } from 'src/modules/payments/entities/user-wallet.entity';
import { UserNovelBookMark } from './entities/user-novel-bookmark.entity';
import { UserNovelRead } from './entities/user-novel-read.entity';
import { UserDailyRead } from './entities/user-daily-read.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';
import { Chapter } from 'src/modules/chapters/entities/chapter.entity';
import { ChapterPurchase } from 'src/modules/payments/entities/chapter-purchase.entity';
import { WalletTransaction } from 'src/modules/payments/entities/wallet-transaction.entity';
import { TransactionType } from 'src/modules/payments/enums/transaction-type.enum';
import { TrackDailyReadDto } from './dto/track-daily-read.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserNovelBookMark)
    private readonly bookmarkRepository: Repository<UserNovelBookMark>,
    @InjectRepository(Novel)
    private readonly novelRepository: Repository<Novel>,
    @InjectRepository(UserNovelRead)
    private readonly readRepository: Repository<UserNovelRead>,
    @InjectRepository(UserDailyRead)
    private readonly dailyReadRepository: Repository<UserDailyRead>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Create user
  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Kiểm tra người dùng tồn tại chưa
    const exists = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('Email already used!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const { password: _, ...result } = await this.dataSource.transaction(
      async (em) => {
        const saved = await em.save(
          em.create(User, { ...dto, password: hashedPassword }),
        );
        await em.save(em.create(UserWallet, { user: saved }));
        return saved;
      },
    );

    return result;
  }

  // Tìm user theo email & password (login)
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  // Tìm user theo id
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  // Hồ sơ công khai — chỉ field an toàn (không email/password/ví/vé)
  async getPublicProfile(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        gender: true,
        role: true,
        chaptersRead: true,
        joinedAt: true,
      },
    });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    return {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
      gender: user.gender,
      role: user.role,
      chaptersRead: user.chaptersRead,
      joinedAt: user.joinedAt,
    };
  }

  // Tìm user theo email
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  // Cập nhật mật khẩu mới (dùng cho reset password)
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  // Cập nhật mật khẩu mới (dùng trong profile)
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) throw new BadRequestException('Người dùng không tồn tại');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    await this.updatePassword(userId, dto.newPassword);
  }

  // Cập nhật thông tin người dùng
  async updateProfile(userId: string, dto: UpdateUserDto): Promise<User> {
    if (!dto.name && !dto.gender) {
      throw new BadRequestException('Cần ít nhất 1 field để cập nhật');
    }

    await this.userRepository.update(userId, dto);

    return this.userRepository.findOneOrFail({ where: { id: userId } });
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ avatarUrl: string }> {
    const result = await this.cloudinaryService.uploadStream(
      file.buffer,
      'avatars',
      userId,
    );

    await this.userRepository.update(userId, { avatarUrl: result.secure_url });

    return { avatarUrl: result.secure_url };
  }

  async getBookmarks(userId: string) {
    const bookmarks = await this.bookmarkRepository.find({
      where: { user: { id: userId } },
      relations: {
        novel: {
          novelCategories: { category: true },
          novelTags: { tag: true },
        },
      },
      order: { createdAt: 'DESC' },
    });

    return bookmarks.map((bm) => ({
      id: bm.id,
      bookmarkedAt: bm.createdAt,
      novel: {
        id: bm.novel.id,
        name: bm.novel.name,
        slug: bm.novel.slug,
        author: bm.novel.author,
        poster: bm.novel.poster,
        status: bm.novel.status,
        rating: bm.novel.rating,
        chapterCount: bm.novel.chapterCount,
        categories:
          bm.novel.novelCategories?.map((nc) => nc.category.name) ?? [],
        tags: bm.novel.novelTags?.map((nt) => nt.tag.name) ?? [],
      },
    }));
  }

  async toggleBookmark(
    userId: string,
    novelId: string,
  ): Promise<{ bookmarked: boolean }> {
    const novelExists = await this.novelRepository.existsBy({ id: novelId });
    if (!novelExists) throw new NotFoundException('Truyện không tồn tại');

    const existing = await this.bookmarkRepository.findOne({
      where: { user: { id: userId }, novel: { id: novelId } },
    });

    if (existing) {
      await this.bookmarkRepository.remove(existing);
      return { bookmarked: false };
    }

    const bookmark = this.bookmarkRepository.create({
      user: { id: userId },
      novel: { id: novelId },
    });

    await this.bookmarkRepository.save(bookmark);
    return { bookmarked: true };
  }

  async getReadHistory(userId: string) {
    const reads = await this.readRepository.find({
      where: { user: { id: userId } },
      relations: { novel: true, chapter: true },
      select: {
        id: true,
        lastReadAt: true,
        novel: { id: true },
        chapter: { id: true, number: true, title: true },
      },
      order: { lastReadAt: 'DESC' },
    });

    return reads.map((r) => ({
      id: r.id,
      novelId: r.novel.id,
      lastReadAt: r.lastReadAt,
      chapter: {
        id: r.chapter.id,
        number: r.chapter.number,
        title: r.chapter.title,
      },
    }));
  }

  async deleteReadHistory(userId: string, readId: string): Promise<void> {
    const record = await this.readRepository.findOne({
      where: { id: readId, user: { id: userId } },
    });

    if (!record) throw new NotFoundException('Lịch sử không tồn tại');

    await this.readRepository.remove(record);
  }

  async clearAllReadHistory(userId: string): Promise<void> {
    await this.readRepository.delete({ user: { id: userId } });
  }

  async claimDailyTicket(
    userId: string,
  ): Promise<{ message: string; recommendationTicket: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });

    // Check đã claim hôm nay chưa
    const claimedToday =
      user.dailyTicketClaimedAt && new Date(user.dailyTicketClaimedAt) >= today;

    if (claimedToday) {
      throw new BadRequestException('Bạn đã nhận vé hôm nay rồi');
    }

    // Đếm số chapter đã đọc hôm nay từ bảng user_daily_reads
    const todayCount = await this.dailyReadRepository.count({
      where: { user: { id: userId }, readDate: today },
    });

    if (todayCount < 10) {
      throw new BadRequestException(
        `Cần đọc đủ 10 chương (hiện tại: ${todayCount})`,
      );
    }

    await this.userRepository.update(userId, {
      dailyTicketClaimedAt: today,
      recommendationTicket: () => '"recommendationTicket" + 1',
    });

    return {
      message: 'Nhận vé đề cử thành công',
      recommendationTicket: user.recommendationTicket + 1,
    };
  }

  // Tiến độ vé đề cử hôm nay — cho UI hiển thị (đọc mấy chương, đã nhận chưa)
  async getDailyProgress(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      select: {
        id: true,
        recommendationTicket: true,
        dailyTicketClaimedAt: true,
      },
    });

    const todayCount = await this.dailyReadRepository.count({
      where: { user: { id: userId }, readDate: today },
    });

    const claimed =
      !!user.dailyTicketClaimedAt &&
      new Date(user.dailyTicketClaimedAt) >= today;

    return {
      todayCount,
      required: 10,
      claimed,
      recommendationTicket: user.recommendationTicket,
    };
  }

  async trackDailyRead(
    userId: string,
    dto: TrackDailyReadDto,
  ): Promise<{ todayCount: number }> {
    const chapterBelongsToNovel = await this.dailyReadRepository.manager
      .getRepository(Chapter)
      .existsBy({ id: dto.chapterId, novel: { id: dto.novelId } });

    if (!chapterBelongsToNovel) {
      throw new BadRequestException('Chapter không thuộc truyện này');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tránh việc insert trùng lặp
    const inserted = await this.dailyReadRepository
      .createQueryBuilder()
      .insert()
      .values({
        user: { id: userId },
        chapter: { id: dto.chapterId },
        readDate: today,
      })
      .orIgnore()
      .execute();

    // Chỉ tăng counter khi chèn mới (lần đầu đọc chương này hôm nay)
    if ((inserted.raw as unknown[]).length > 0) {
      await this.novelRepository.increment({ id: dto.novelId }, 'views', 1);
      await this.userRepository.increment({ id: userId }, 'chaptersRead', 1);
    }

    // Luôn cập nhật chapter đọc gần nhất dù đã đọc hôm nay hay chưa
    await this.readRepository.upsert(
      {
        user: { id: userId },
        novel: { id: dto.novelId },
        chapter: { id: dto.chapterId },
      },
      ['user', 'novel'],
    );

    const todayCount = await this.dailyReadRepository.count({
      where: { user: { id: userId }, readDate: today },
    });

    return { todayCount };
  }

  // Thống kê truyện của chính user: lượt đọc, đề cử, số lượt mở khoá, tiền quà, tiền mở khoá.
  // views/nominations lấy sẵn trên bảng novels; unlocked/revenue tổng hợp từ chapter_purchases;
  // gifts tổng hợp từ wallet_transactions (chỉ giao dịch GIFT — amount lưu số âm bên người tặng).
  async getMyNovelsStats(userId: string) {
    const novels = await this.novelRepository.find({
      where: { postedBy: { id: userId } },
      select: {
        id: true,
        name: true,
        author: true,
        views: true,
        nominations: true,
      },
      order: { createdAt: 'DESC' },
    });
    if (novels.length === 0) return [];

    const ids = novels.map((n) => n.id);

    // Tổng lượt mở khoá + tiền mở khoá theo từng truyện
    const purchaseRows = await this.dataSource
      .getRepository(ChapterPurchase)
      .createQueryBuilder('cp')
      .select('cp.novel_id', 'novelId')
      .addSelect('COUNT(*)', 'unlocked')
      .addSelect('COALESCE(SUM(cp.candySpent), 0)', 'revenue')
      .where('cp.novel_id IN (:...ids)', { ids })
      .groupBy('cp.novel_id')
      .getRawMany<{ novelId: string; unlocked: string; revenue: string }>();

    // Tổng kẹo được tặng theo từng truyện (amount âm bên người tặng nên lấy trị tuyệt đối)
    const giftRows = await this.dataSource
      .getRepository(WalletTransaction)
      .createQueryBuilder('wt')
      .select('wt.referenceId', 'novelId')
      .addSelect('COALESCE(SUM(ABS(wt.amount)), 0)', 'gifts')
      .where('wt.type = :type', { type: TransactionType.GIFT })
      .andWhere('wt.referenceType = :refType', { refType: 'novel' })
      .andWhere('wt.referenceId IN (:...ids)', { ids })
      .groupBy('wt.referenceId')
      .getRawMany<{ novelId: string; gifts: string }>();

    const purchaseMap = new Map(purchaseRows.map((r) => [r.novelId, r]));
    const giftMap = new Map(giftRows.map((r) => [r.novelId, r]));

    return novels.map((n) => {
      const p = purchaseMap.get(n.id);
      const g = giftMap.get(n.id);
      return {
        id: n.id,
        name: n.name,
        author: n.author,
        views: n.views,
        nominated: n.nominations,
        unlocked: p ? Number(p.unlocked) : 0,
        gifts: g ? Number(g.gifts) : 0,
        revenue: p ? Number(p.revenue) : 0,
      };
    });
  }
}
