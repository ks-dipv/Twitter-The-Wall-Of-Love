import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerservices: MailerService) {}

  public async sendResetPassword(url: string, email: string): Promise<void> {
    await this.mailerservices.sendMail({
      to: email,
      from: `Onboarding Team <support@twitter.com>`,
      subject: 'Reset Password',
      template: './resetpassword',
      context: {
        email: email,
        resetPasswordUrl: url,
      },
    });
  }
}
