import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Task } from './task.entity';
import { User } from 'src/user/entities/user/user';
import { UserService } from 'src/user/user.service';
import { EmailService } from 'src/mailer/email.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private userService: UserService, // UserService to manage user data
    private readonly mailService: EmailService, // Fix: Removed extra closing parenthesis
  ) {}

  // async assignTaskToUser(userEmail: string, taskDetails: string) {
  //   // Call the email service to send a notification
  //   await this.mailService.sendTaskAssignedEmail(userEmail, taskDetails);
  // }



  // ✅ Fetch all tasks (Admin feature)
  async findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  async createTask(
    title: string, 
    description: string, 
    assignedUserId: string,  
    deadline: Date // Make deadline optional
  ): Promise<Task> {
    console.log("🚀 Assigned User ID:", assignedUserId);
    
    const task = new Task();
    task.title = title;
    task.description = description;
    task.deadline = deadline;  // Use null if no deadline is provided
    task.status = 'Not Started';  
    task.completed = false;      
    task.userId = assignedUserId;  
  
    console.log("📝 Saving Task with assignedUserId:", task.userId);
    
    return this.taskRepository.save(task);
  }
  
  

  
  

  // ✅ Fetch tasks for a specific user (User-specific)
  async getAllTasks(userId: string): Promise<Task[]> {
    console.log("Fetching tasks for userId:", userId);

    const tasks = await this.taskRepository.find({
      where: { userId, deleted: false }
    });

    console.log("Tasks found:", tasks.length);

    return tasks;
  }

  // ✅ Get task by ID (User-specific)
  async getTaskById(taskId: string, userId: string): Promise<Task | null> {
    const task = await this.taskRepository.findOne({
      where: { taskId, userId, deleted: false }
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  // ✅ Update task details (User-specific)
  async updateTask(
    taskId: string,
    title: string,
    description: string,
    completed: boolean,
    status: string,
    userId: string,
  ): Promise<Task | null> {
    const task = await this.getTaskById(taskId, userId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.title = title;
    task.description = description;
    task.completed = completed;
    task.status = status;

    return this.taskRepository.save(task);
  }

  // ✅ Mark a task as completed (User-specific)
  async completeTask(taskId: string, userId: string): Promise<Task | null> {
    const task = await this.getTaskById(taskId, userId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.status = 'Completed';
    task.completed = true;

    return this.taskRepository.save(task);
  }

  // ✅ Mark a task as in progress (User-specific)
  async markInProgress(taskId: string, userId: string): Promise<Task | null> {
    const task = await this.getTaskById(taskId, userId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.status = 'In Progress';

    return this.taskRepository.save(task);
  }

  // ✅ Soft delete a task by setting 'deleted' flag (User-specific)
  async softDelete(taskId: string, userId: string): Promise<Task | null> {
    const task = await this.getTaskById(taskId, userId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.deleted = true;
    return this.taskRepository.save(task);
  }

  // ✅ Assign a task to a user (Admin feature)
// ✅ Assign a task to a user (Admin feature)
async assignTaskToUser(userId: string, taskId: string, deadline?: Date): Promise<Task> {
  console.log(`📌 Assigning Task ${taskId} to User ${userId}`);

  // Check if task exists
  const task = await this.taskRepository.findOne({ where: { taskId } });
  if (!task) {
    throw new NotFoundException('Task not found');
  }

  // Check if user exists
  const user = await this.userService.findById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Ensure the user has an email before sending an email
  if (!user.email) {
    console.warn(`⚠️ User ${userId} does not have an email. Task assigned without notification.`);
  }

  // Assign task to user
  task.userId = userId;

  // Set deadline only if provided (admin-assigned task)
  if (deadline) {
    task.deadline = deadline;
  }

  console.log(`✅ Task assigned successfully with deadline: ${deadline}`);

  // Save the updated task
  const updatedTask = await this.taskRepository.save(task);

  // ✅ Send email notification to the assigned user (only if email exists)
  if (user.email) {
    try {
      console.log(`📧 Sending email to ${user.email}...`);
      await this.mailService.sendEmail({
        recipients: [user.email], // Array of recipient emails
        subject: 'Task Assignment Notification',
        html: `<p>Task: ${task.taskId} has been assigned to you.</p>
               <p>Deadline: ${deadline ? deadline.toISOString() : 'No deadline set'}</p>`,
      });
      console.log(`✅ Email successfully sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
    }
  }

  return updatedTask;
}




  // ✅ Fetch all tasks with user details (Admin feature)
  async getAllTasksWithUsers(): Promise<Task[]> {
    return this.taskRepository.find({
      relations: ['user'], // Fetch the related user data with each task
    });
  }

  async getRegularTasks(): Promise<Task[]> {
    const tasks = await this.taskRepository.find({
      where: {
        deadline: IsNull(),  // Tasks without a deadline (null)
      },
    });
    console.log('Regular Tasks:', tasks);  // Log the tasks
    return tasks;
  }
  
  async getAdminAssignedTasks(): Promise<Task[]> {
    const tasks = await this.taskRepository.find({
      where: {
        deadline: Not(IsNull()),  // Tasks with a deadline (non-null)
      },
    });
    console.log('Admin Assigned Tasks:', tasks);  // Log the tasks
    return tasks;
  }
  

}