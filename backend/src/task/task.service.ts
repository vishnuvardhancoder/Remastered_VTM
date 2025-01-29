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
  async createTask(title: string, description: string, userId: number | string): Promise<Task> {
  // console.log('Creating task for user:', userId);  // Log userId to see what's passed
  let user: User;

  if (typeof userId === 'string') {
    // console.log('Searching for Google user with googleId:', userId);  // Log googleId
    user = await this.userService.findByGoogleId(userId);

    // Log if user is found or not
    if (!user) {
      // console.log('Google user not found with googleId:', userId);  // Log if not found
      // Create new Google user if not found
      user = new User();
      user.googleId = userId;
      user.email = 'google_user@example.com';  // Make sure to set the real email from OAuth response
      user.firstname = 'Google';
      user.lastname = 'User';
      user.username = userId;  // You can adjust username handling as needed
      user.role = 'user';

      // Use the userRepository to save the new user
      user = await this.userService.create(user);
      // console.log('Created new Google user:', user);
    } else {
      // console.log('Found Google user:', user);  // Log user details
    }
  } else {
    // console.log('Searching for normal user with userId:', userId);  // Log userId
    user = await this.userService.findById(userId);

    // Log if user is found or not
    if (!user) {
      // console.log('Normal user not found with userId:', userId);  // Log if not found
      throw new NotFoundException('Normal user not found');
    } else {
      // console.log('Found normal user:', user);  // Log user details
    }
  }

  // Create the task and associate it with the user
  const task = new Task();
  task.title = title;
  task.description = description;
  task.status = 'notCompleted';
  task.completed = false;
  task.userId = user.id;  // Associate task with the correct user (Google or normal)

  // Save the task and return
  return this.taskRepository.save(task);
}

  

  // ✅ To get all tasks (User-specific)
  async getAllTasks(userId: number): Promise<Task[]> {
    const tasks = await this.taskRepository.find({ where: { userId, deleted: false } });  // Ensure deleted tasks are excluded
    if (!tasks || tasks.length === 0) {
      throw new NotFoundException('No tasks found for the user');
    }
    return tasks;
  }

  // ✅ To get a task by id (User-specific)
  async getTaskById(id: number, userId: number): Promise<Task | null> {
    const task = await this.taskRepository.findOne({ where: { id, userId, deleted: false } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  // ✅ To update a task (User-specific)
  async updateTask(
    id: number,
    title: string,
    description: string,
    completed: boolean,
    status: string,  // Pass status field in the update
    userId: number,  // User ID to ensure task belongs to the user
  ): Promise<Task | null> {
    const task = await this.getTaskById(id, userId);  // Fetch task specific to user
    if (task) {
      task.title = title;
      task.description = description;
      task.completed = completed;
      task.status = status;  // Update status here

      return this.taskRepository.save(task);
    }
    throw new NotFoundException('Task not found');
  }

  // ✅ To mark a task as completed (User-specific)
  async completeTask(id: number, userId: number): Promise<Task | null> {
    const task = await this.getTaskById(id, userId);  // Fetch task specific to user
    if (task) {
      task.status = 'Completed';
      task.completed = true;
      return this.taskRepository.save(task);
    }
    throw new NotFoundException('Task not found');
  }

  // ✅ To mark a task as in progress (User-specific)
  async markInProgress(id: number, userId: number): Promise<Task | null> {
    const task = await this.getTaskById(id, userId);  // Fetch task specific to user
    if (task) {
      task.status = 'In Progress';  // Set status to 'In Progress'
      return this.taskRepository.save(task);
    }
    throw new NotFoundException('Task not found');
  }

  // ✅ Soft delete a task by setting the 'deleted' flag to true (User-specific)
  async softDelete(id: number, userId: number): Promise<Task | null> {
    const task = await this.taskRepository.findOne({ where: { id, userId, deleted: false } });  // Ensure task belongs to the user
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.deleted = true;
    await this.taskRepository.save(task);

    return task;
  }
}
