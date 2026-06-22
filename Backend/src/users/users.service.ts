import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException } from '@nestjs/common/exceptions';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}
