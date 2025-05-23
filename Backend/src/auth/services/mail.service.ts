import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerservices: MailerService,
    private readonly configService: ConfigService,
  ) {}

  public async sendResetPassword(url: string, email: string): Promise<void> {
    await this.mailerservices.sendMail({
      to: email,
      from: this.configService.get('appConfig.emailFrom'),
      subject: 'Reset Password',
      template: './resetpassword',
      context: {
        email: email,
        resetPasswordUrl: url,
      },
    });
  }

  public async sendVerificationEmail(
    url: string,
    email: string,
  ): Promise<void> {
    await this.mailerservices.sendMail({
      to: email,
      from: this.configService.get('appConfig.emailFrom'),
      subject: 'Email Verification',
      template: './verify-email',
      context: {
        email: email,
        verificationUrl: url,
      },
    });
  }

  public async sendInvitationEmail(url: string, email: string): Promise<void> {
    await this.mailerservices.sendMail({
      to: email,
      from: this.configService.get('appConfig.emailFrom'),
      subject: 'Role Assign Invite',
      template: './invitation-mail',
      context: {
        email: email,
        invitationUrl: url,
      },
    });
  }
}
