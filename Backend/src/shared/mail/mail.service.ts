import { Injectable } from '@nestjs/common';
import { User } from 'src/modules/users/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendResetPassword(user: User, token: string) {
    // Link trỏ tới trang reset-password phía frontend (form nhập mật khẩu mới),
    // trang đó sẽ gọi POST /auth/reset-password kèm token.
    const frontendUrl = process.env.FRONTEND_URL;
    const url = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset password',
      template: './reset-password',
      context: {
        appName: 'Novel App',
        name: user.name,
        resetLink: url,
        token,
        expiresInMinutes: 15,
        supportEmail: 'support@novel.com',
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
