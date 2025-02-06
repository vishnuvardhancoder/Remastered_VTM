import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user/user';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Method to find a user by username
  async findByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOneBy({ username });
  }

  // Method to find a user by email
  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOneBy({ email });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { googleId } });
  }

  // Method to create a new user
  // Method to create a new user
async create(createUserDto: CreateUserDto): Promise<User> {
  // If the username is from Google login (contains '@')
  if (createUserDto.username && createUserDto.username.includes('@')) {
    // Remove everything after '@' to use part before as the username
    createUserDto.username = createUserDto.username.split('@')[0];
  }

  const existingUser = await this.findByUsername(createUserDto.username);
  if (existingUser) {
    throw new ConflictException(`Username "${createUserDto.username}" already exists`);
  }

  const existingEmail = await this.findByEmail(createUserDto.email);
  if (existingEmail) {
    throw new ConflictException(`Email "${createUserDto.email}" already exists`);
  }

  const user = this.userRepository.create(createUserDto);
  return this.userRepository.save(user);
}

  // Method to get all users
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // Find a user by their user ID
  async findById(userId: string): Promise<User | null> {
    if (!userId) {
        throw new BadRequestException("Invalid userId: received undefined or null");
    }

    // console.log("🔍 Fetching User ID:", userId); // Debug log
    const user = await this.userRepository.findOne({ where: { userId } });

    // console.log("✅ Found User:", user ? user.userId : "User Not Found");
    return user;
}


// Add this method to fetch all users with their tasks
async findAllUsersWithTasks(): Promise<User[]> {
  return this.userRepository.find({
    relations: ['tasks'], // This will fetch tasks for each user
  });
}

}
