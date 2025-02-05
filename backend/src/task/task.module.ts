import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { UserModule } from '../user/user.module';  // Import UserModule
import { EmailService } from 'src/mailer/email.service';
import { EmailModule } from 'src/mailer/mailer.module';
// import { MailerCustomModule } from 'src/mailer/mailer.module'; // ✅ Import MailerCustomModule


@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    UserModule,  // Add UserModule to imports array correctly
    // MailerCustomModule,
    EmailModule,
  ],
  providers: [TaskService],
  controllers: [TaskController],
  exports: [TaskService],  // Export TaskService so it can be used in other modules
})
export class TaskModule {}
