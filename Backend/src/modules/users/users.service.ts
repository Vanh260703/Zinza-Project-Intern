import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';
import { UserWallet } from 'src/modules/payments/entities/user-wallet.entity';
import { UserNovelBookMark } from './entities/user-novel-bookmark.entity';
import { UserNovelRead } from './entities/user-novel-read.entity';
import { UserDailyRead } from './entities/user-daily-read.entity';
import { Novel } from 'src/modules/novels/entities/novel.entity';
import { TrackDailyReadDto } from './dto/track-daily-read.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserWallet)
    private readonly walletRepository: Repository<UserWallet>,
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

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });

    const saved = await this.userRepository.save(user);

    await this.walletRepository.save(
      this.walletRepository.create({ user: saved }),
    );

    // Tách password ra trước khi trả về client
    const { password: _, ...result } = saved;

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
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
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

  async trackDailyRead(userId: string, dto: TrackDailyReadDto): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.dailyReadRepository.findOne({
      where: {
        user: { id: userId },
        chapter: { id: dto.chapterId },
        readDate: today,
      },
    });

    if (!existing) {
      await this.dailyReadRepository.save(
        this.dailyReadRepository.create({
          user: { id: userId },
          chapter: { id: dto.chapterId },
          readDate: today,
        }),
      );
      await this.novelRepository.increment({ id: dto.novelId }, 'views', 1);
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
  }
}
