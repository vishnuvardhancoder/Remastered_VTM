import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { sendEmailDto } from './email.dto';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  emailTransport() {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });

    return transporter;
  }

  async sendEmail(dto: sendEmailDto) {
    const { recipients, subject, html } = dto;
    const transport = this.emailTransport();

    const options: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: recipients,
      subject: subject,
      html: html,
    };
    try {
      await transport.sendMail(options);
      // console.log('Email sent successfully');
    } catch (error) {
      // console.log('Error sending mail: ', error);
    }
  }

  // ✅ New method to send task assignment emails
  async sendTaskAssignmentEmail(to: string, task: any) {
    await this.sendEmail({
      recipients: [to],  // Convert single email string to an array
      subject: `New Task Assigned: ${task.title}`,
      html: '',
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border: 3px solid #007bff; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif; color: #333333;">
  
        <!-- Header with Blue Background -->
        <div style="background-color: #007bff; padding: 15px; text-align: center; border-radius: 7px 7px 0 0;">
          <h2 style="color: #ffffff; margin: 0;">Welcome to VTaskManager!</h2>
        </div>
  
        <!-- Content Section with Padding -->
        <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 7px 7px;">
          
          <!-- Greeting -->
          <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
  
          <!-- Introduction -->
          <p style="font-size: 16px;">We're excited to have you on board! 🎉</p>
          <p style="font-size: 16px;">You can now start adding and managing your tasks effortlessly with <strong>VTaskManager</strong>.</p>
  
          <!-- Call to Action -->
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://your-app-url.com/dashboard" 
               style="background-color: #007bff; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
               Start Managing Your Tasks
            </a>
          </div>
  
          <!-- Footer -->
          <p style="font-size: 16px; margin-top: 20px;">If you have any questions, feel free to reach out.</p>
  
          <p style="font-size: 16px;">Happy task managing! 🚀</p>
  
          <div style="text-align: center; margin-top: 20px;">
            <p style="font-weight: bold;">Best regards,</p>
            <p style="font-weight: bold; color: #007bff;">The VTaskManager Team</p>
          </div>
        </div>
  
      </div>
    `;
  
    await this.sendEmail({
      recipients: [to],
      subject: 'Welcome to VTaskManager!',
      html: htmlContent,
    });
  }
  
}  