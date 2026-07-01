import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { UserWallet } from 'src/modules/payments/entities/user-wallet.entity';
import { UserGender, UserRole } from 'src/modules/users/enums';
import { SEED_PASSWORD, StoryJson } from './seed.config';

export async function seedUsers(
  ds: DataSource,
  data: StoryJson[],
): Promise<Map<string, User>> {
  const userRepo = ds.getRepository(User);
  const walletRepo = ds.getRepository(UserWallet);
  const names = [...new Set(data.map((s) => s.postedBy))];
  const map = new Map<string, User>();
  const hashedPw = await bcrypt.hash(SEED_PASSWORD, 10);

  for (const name of names) {
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}.seed@novel.vn`;
    let user = await userRepo.findOne({ where: { email } });
    if (!user) {
      user = await userRepo.save(
        userRepo.create({
          name,
          email,
          password: hashedPw,
          gender: UserGender.OTHER,
          role: UserRole.USER,
        }),
      );
      await walletRepo.save(walletRepo.create({ user }));
    }
    map.set(name, user);
  }

  console.log(`👤 Users: ${map.size}`);
  return map;
}
