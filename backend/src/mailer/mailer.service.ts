import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendTaskAssignedEmail(toEmail: string, taskDetails: string) {
    try {
      await this.mailerService.sendMail({
        to: toEmail,
        subject: 'New Task Assigned',
        template: 'task-assigned', // Name of the template file (if using templates)
        context: { taskDetails }, // Data for the template
        text: `You have been assigned a new task: ${taskDetails}`,
        html: `<p>You have been assigned a new task: <strong>${taskDetails}</strong></p>`,
      });

      console.log(`Email sent successfully to ${toEmail}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
