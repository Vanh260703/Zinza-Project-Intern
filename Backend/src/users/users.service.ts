import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConflictException } from '@nestjs/common/exceptions';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserWallet } from 'src/payments/entities/user-wallet.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserWallet)
    private readonly walletRepository: Repository<UserWallet>,
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
  async findbyEmail(email: string): Promise<User | null> {
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
}
