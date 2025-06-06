import { 
    Body, Controller, Get, Param, Patch, Post, Put, UseGuards, Request, 
    NotFoundException,
    InternalServerErrorException,
    BadRequestException
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { EmailService } from 'src/mailer/email.service';

@ApiTags('Tasks')
@Controller('task')
export class TaskController {
    // emailService: any;
    constructor(private readonly taskService: TaskService,
        private readonly userService: UserService,
        private readonly emailService: EmailService 
    ) {}
    // Inject the UserService here
  
 
    
    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Create a new task' })
    @ApiResponse({ status: 201, description: 'Task created successfully.', type: Task })
    @ApiBody({
        description: 'Task details',
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string' }
            },
            required: ['title', 'description']
        }
    })
    // In your controller method:
    // async create(
    //     @Body() body: { title: string; description: string; assignedUserId?: string; deadline?: string },
    //     @Request() req
    //   ): Promise<{ task: Task; assignedUserEmail?: string; assignedUserName?: string }> {
    //     try {
    //       const loggedInUserId = req.user.userId;
    //       const isAssignedTask = !!body.assignedUserId; // True if the task is assigned
      
    //       if (isAssignedTask && (!body.deadline || isNaN(Date.parse(body.deadline)))) {
    //         console.error("❌ Assigned task requires a valid deadline:", body.deadline);
    //         throw new BadRequestException("Assigned tasks must have a valid deadline.");
    //       }
          
      
    //       const finalUserId = isAssignedTask ? body.assignedUserId : loggedInUserId;
    //       console.log("🔍 Looking up user with ID:", finalUserId);

      
    //       const user = await this.userService.findById(finalUserId);
    //       if (!user) {
    //         throw new NotFoundException('Assigned user not found');
    //       }
      
    //       const task = await this.taskService.createTask(
    //         body.title,
    //         body.description,
    //         finalUserId,
    //         isAssignedTask ? new Date(body.deadline) : null  // Only save deadline for assigned tasks
    //       );
    
    //       // Define the response object with a clear structure
    //       const response: { task: Task; assignedUserEmail?: string; assignedUserName?: string } = { task };
      
    //       if (isAssignedTask) {
    //         response.assignedUserEmail = user.email; // Add email to the response
      
    //         // Check if the user already has a username, if so, use that
    //         let username = user.username;
      
    //         // If the username is not set (empty or null), extract from email
    //         if (!username || username.includes('@')) {
    //             // For Google users: Extract username from email (everything before '@')
    //             username = user.email.split('@')[0];
    //           }
              
      
    //         response.assignedUserName = username; // Send the username
      
    //         console.log("Assigned User Username:", username); // Debugging
    //       }
    //       if (!user.email) {
    //         console.warn(`⚠️ User ${finalUserId} has no email. Task created without notification.`);
    //       }
          
        
    //       return response;
    //     } catch (error) {
    //       console.error("🚨 Error in Task Creation:", error);
    //       throw new InternalServerErrorException('Failed to create task');
    //     }
    //   }
      
      
    // async create(
    //     @Body() body: { title: string; description: string; assignedUserId?: string; deadline?: string },
    //     @Request() req
    // ): Promise<Task> {
    //     try {
    //         const loggedInUserId = req.user.userId;
    //         const isAssignedTask = !!body.assignedUserId; // True if the task is assigned
    
    //         if (isAssignedTask && (!body.deadline || isNaN(Date.parse(body.deadline)))) {
    //             console.error("❌ Assigned task requires a valid deadline:", body.deadline);
    //             throw new BadRequestException("Assigned tasks must have a valid deadline.");
    //         }
    
    //         const finalUserId = isAssignedTask ? body.assignedUserId : loggedInUserId;
    
    //         const user = await this.userService.findById(finalUserId);
    //         if (!user) {
    //             throw new NotFoundException('Assigned user not found');
    //         }
    
    //         const task = await this.taskService.createTask(
    //             body.title,
    //             body.description,
    //             finalUserId,
    //             isAssignedTask ? new Date(body.deadline) : null  // Only save deadline for assigned tasks
    //         );
    //         let username = user.username;
    //         if (!username || username.includes('@')) {
    //             // For Google users: Extract username from email (everything before '@')
    //             username = user.email.split('@')[0];
    //           }
    
    //         // ✅ Wrap the task inside an object that matches the expected return type
    //         // return { 
    //         //     task, 
    //         //     // assignedUserEmail: isAssignedTask ? user.email : undefined ,
    //         //     // assignedUserName : isAssignedTask ? username : undefined
    //         // };
    //         return task;
    //     } catch (error) {
    //         console.error("🚨 Error in Task Creation:", error);
    //         throw new InternalServerErrorException('Failed to create task');
    //     }
    // }
    
    async create(
        @Body() body: { title: string; description: string; assignedUserId?: string; deadline?: string },
        @Request() req
      ): Promise<{ task: Task; assignedUserEmail?: string; assignedUserName?: string; assignedUserId?: string }> {
        try {
          const loggedInUserId = req.user.userId;
          const isAssignedTask = !!body.assignedUserId;
      
          if (isAssignedTask && (!body.deadline || isNaN(Date.parse(body.deadline)))) {
            throw new BadRequestException("Assigned tasks must have a valid deadline.");
          }
      
          const finalUserId = isAssignedTask ? body.assignedUserId : loggedInUserId;
      
          const user = await this.userService.findById(finalUserId);
          if (!user) {
            throw new NotFoundException('Assigned user not found');
          }
      
          const task = await this.taskService.createTask(
            body.title,
            body.description,
            finalUserId,
            isAssignedTask ? new Date(body.deadline) : null
          );
      
          if (!task || !task.taskId) {
            throw new InternalServerErrorException("Task creation failed.");
          }
      
          const response: { task: Task; assignedUserEmail?: string; assignedUserName?: string; assignedUserId?: string } = {
            task,
            assignedUserId: finalUserId,
          };
      
          if (isAssignedTask) {
            response.assignedUserEmail = user.email;
            response.assignedUserName = user.username || user.email.split('@')[0];
      
            // Send email asynchronously without waiting for the response
            setTimeout(() => {
              this.emailService.sendTaskAssignmentEmail(user.email, task);
            }, 0);
          }
      
          return response;
        } catch (error) {
          throw new InternalServerErrorException('Failed to create task');
        }
      }
      
    
    

    

      
    
    
    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiOperation({ summary: 'Retrieve all tasks for the logged-in user' })
    @ApiResponse({ status: 200, description: 'List of user tasks', type: [Task] })
    async findAll(@Request() req): Promise<Task[]> {
        const userId: string = req.user.userId;
        return this.taskService.getAllTasks(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    @ApiOperation({ summary: 'Get a task by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Task ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Task found', type: Task })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async findOne(@Param('id') id: string, @Request() req): Promise<Task> {
        const userId: string = req.user.userId;
        return this.taskService.getTaskById(id, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @ApiOperation({ summary: 'Update a task' })
    @ApiParam({ name: 'id', type: 'string', description: 'Task ID (UUID)' })
    @ApiBody({
        description: 'Updated task data',
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                completed: { type: 'boolean' },
                status: { type: 'string' }
            },
            required: ['title', 'description', 'completed', 'status']
        }
    })
    @ApiResponse({ status: 200, description: 'Task updated successfully', type: Task })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async update(
        @Param('id') id: string,
        @Body() body: { title: string; description: string; completed: boolean; status: string },
        @Request() req
    ): Promise<Task | null> {
        const userId: string = req.user.userId;
        return this.taskService.updateTask(id, body.title, body.description, body.completed, body.status, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/complete')
    @ApiOperation({ summary: 'Mark task as completed' })
    @ApiParam({ name: 'id', type: 'string', description: 'Task ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Task marked as completed', type: Task })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async complete(@Param('id') id: string, @Request() req): Promise<Task | null> {
        const userId: string = req.user.userId;
        return this.taskService.completeTask(id, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/inprogress')
    @ApiOperation({ summary: 'Mark task as in progress' })
    @ApiParam({ name: 'id', type: 'string', description: 'Task ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Task marked as in progress', type: Task })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async markInProgress(@Param('id') id: string, @Request() req): Promise<Task | null> {
        const userId: string = req.user.userId;
        return this.taskService.markInProgress(id, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/delete')
    @ApiOperation({ summary: 'Soft delete a task' })
    @ApiParam({ name: 'id', type: 'string', description: 'Task ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Task soft-deleted', type: Task })
    async softDelete(@Param('id') id: string, @Request() req): Promise<Task | null> {
        const userId: string = req.user.userId;
        return this.taskService.softDelete(id, userId);
    }

    // ✅ Assign a task to a user
    @UseGuards(JwtAuthGuard)
    @Post(':id/assign')
    @ApiOperation({ summary: 'Assign a task to a user' })
    @ApiParam({ name: 'id', type: 'string', description: 'Task ID (UUID)' })
    @ApiBody({
        description: 'Assign task to a specific user',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string' }
            },
            required: ['userId']
        }
    })
    @ApiResponse({ status: 200, description: 'Task assigned successfully', type: Task })
    @ApiResponse({ status: 404, description: 'Task or user not found' })
    async assignTask(
        @Param('id') taskId: string,
        @Body() body: { userId: string }
    ): Promise<Task | null> {
        return this.taskService.assignTaskToUser(taskId, body.userId);
    }

    // ✅ Retrieve all tasks with assigned user details
    @UseGuards(JwtAuthGuard)
    @Get('/all')
    @ApiOperation({ summary: 'Retrieve all tasks with assigned users (Admin only)' })
    @ApiResponse({ status: 200, description: 'List of all tasks with assigned users', type: [Task] })
    async getAllTasksWithUsers() {
        return await this.taskService.getAllTasksWithUsers();
    }
}