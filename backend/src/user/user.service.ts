import { Injectable, ConflictException } from '@nestjs/common';
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
    const user = await this.userRepository.findOneBy({ username });
    // console.log('Found user by username:', user ? { ...user, password: '[HIDDEN]' } : null);
    return user;
  }

  // Method to find a user by email
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ email });
    // console.log('Found user by email:', user ? { ...user, password: '[HIDDEN]' } : null);
    return user;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    // console.log('Searching for user with googleId:', googleId);  // Log googleId being searched
    return this.userRepository.findOne({ where: { googleId } });
  }
    
  
  
  // Method to create a new user
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByUsername(createUserDto.username);
    if (existingUser) {
      throw new ConflictException(`Username "${createUserDto.username}" already exists`);
    }
  
    const existingEmail = await this.findByEmail(createUserDto.email);
    if (existingEmail) {
      throw new ConflictException(`Email "${createUserDto.email}" already exists`);
    }
  
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    // console.log('Created user:', { ...savedUser, password: '[HIDDEN]' });
    return savedUser;
  }
  

  // Method to get all users
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // Find a user by their user ID
  async findById(userId: number): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  
}
