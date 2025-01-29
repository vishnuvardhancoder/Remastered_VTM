import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { User } from './entities/user/user';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.userService.create(createUserDto)
    }

    
}
