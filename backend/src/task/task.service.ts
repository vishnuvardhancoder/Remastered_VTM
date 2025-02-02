import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { User } from 'src/user/entities/user/user';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private userService: UserService, // UserService to manage user data
  ) {}

  // ✅ To get all tasks (User-specific)
  async findAll(): Promise<Task[]> {
    return this.taskRepository.find();  // Retrieve all tasks
  }

  // ✅ To create a new task (User-specific)
  async createTask(title: string, description: string, userId: string): Promise<Task> {
    console.log("🚀 Received userId for Task:", userId); // Debug log

    const user = await this.userService.findById(userId);
    if (!user) {
        throw new NotFoundException('User not found');
    }

    console.log("✅ Found User ID:", user.userId); // Debug log

    const task = new Task();
    task.title = title;
    task.description = description;
    task.status = 'notCompleted';
    task.completed = false;
    task.userId = user.userId; // Ensure correct user ID

    console.log("📝 Saving Task with userId:", task.userId); // Debug log

    return this.taskRepository.save(task);
}



  // ✅ To get all tasks (User-specific)
  async getAllTasks(userId: string): Promise<Task[]> {
    console.log("Fetching tasks for userId:", userId); // Debug log

    const tasks = await this.taskRepository.find({
        where: { userId, deleted: false }
    });

    console.log("Tasks found:", tasks.length); // Debug log

    return tasks;
}

  // ✅ To get a task by ID (User-specific)
  async getTaskById(taskId: string, userId: string): Promise<Task | null> {
    const task = await this.taskRepository.findOne({ where: { taskId, userId, deleted: false } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  // ✅ To update a task (User-specific)
  async updateTask(
    taskId: string,
    title: string,
    description: string,
    completed: boolean,
    status: string,  
    userId: string,  
  ): Promise<Task | null> {
    const task = await this.getTaskById(taskId, userId);
    if (task) {
      task.title = title;
      task.description = description;
      task.completed = completed;
      task.status = status;  

      return this.taskRepository.save(task);
    }
    throw new NotFoundException('Task not found');
  }

  // ✅ To mark a task as completed (User-specific)
  async completeTask(taskId: string, userId: string): Promise<Task | null> {
    const task = await this.getTaskById(taskId, userId);
    if (task) {
      task.status = 'Completed';
      task.completed = true;
      return this.taskRepository.save(task);
    }
    throw new NotFoundException('Task not found');
  }

  // ✅ To mark a task as in progress (User-specific)
  async markInProgress(taskId: string, userId: string): Promise<Task | null> {
    const task = await this.getTaskById(taskId, userId);
    if (task) {
      task.status = 'In Progress';  
      return this.taskRepository.save(task);
    }
    throw new NotFoundException('Task not found');
  }

  // ✅ Soft delete a task by setting the 'deleted' flag to true (User-specific)
  async softDelete(taskId: string, userId: string): Promise<Task | null> {
    const task = await this.taskRepository.findOne({ where: { taskId, userId, deleted: false } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.deleted = true;
    await this.taskRepository.save(task);

    return task;
  }


   // Method to assign a task to a user
   async assignTaskToUser(userId: string, taskId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { taskId }, // Pass an object with a condition (where clause)
    });

    if (!task) {
      throw new Error('Task not found');
    }

    task.userId = userId; // Assign task to user
    return this.taskRepository.save(task); // Save the task
  }

   // ✅ Fetch all tasks with user details
   async getAllTasksWithUsers() {
    return await this.taskRepository.find({
      relations: ['user'],  // Fetch the related user data with each task
    });
  }
  
  
}
