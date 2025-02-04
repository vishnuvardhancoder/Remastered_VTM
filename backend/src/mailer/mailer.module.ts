import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mailer.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST, // SMTP host (smtp.gmail.com)
        port: parseInt(process.env.MAIL_PORT, 10), // Port for Gmail SMTP (587 for TLS, 465 for SSL)
        secure: process.env.MAIL_PORT === '465', // Set secure to true only if using port 465 (SSL)
        auth: {
          user: process.env.MAIL_USER, // Gmail email ID from .env
          pass: process.env.MAIL_PASS, // Gmail App password from .env
        },
      },
      defaults: {
        from: `"Task Manager" <${process.env.MAIL_USER}>`, // Use the Gmail address configured in .env
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailerCustomModule {}
