import { Body, Controller, Get, Param, Patch, Post, Put, UseGuards, Request } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Tasks')
@Controller('task')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

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
    async create(@Body() body: { title: string; description: string }, @Request() req): Promise<Task> {
        console.log("🚀 Logged-in User ID (from req.user):", req.user.userId);
        const userId: string = req.user.userId;
        return this.taskService.createTask(body.title, body.description, userId);
    }
    
    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiOperation({ summary: 'Retrieve all tasks' })
    @ApiResponse({ status: 200, description: 'List of all tasks', type: [Task] })
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


    // ✅ New endpoint to get all tasks with assigned user details
  @UseGuards(JwtAuthGuard)
  @Get('/all')
  async getAllTasksWithUsers() {
    return await this.taskService.getAllTasksWithUsers();
  }

}
