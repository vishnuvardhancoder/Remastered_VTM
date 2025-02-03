import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mailer.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT, 10),
        secure: false, // Set to `true` if using port 465 (SSL)
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: '"Task Manager" <no-reply@yourdomain.com>',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailerCustomModule {}
