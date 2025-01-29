import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { UserModule } from '../user/user.module';  // Import UserModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    UserModule,  // Add UserModule to imports array correctly
  ],
  providers: [TaskService],
  controllers: [TaskController],
})
export class TaskModule {}
