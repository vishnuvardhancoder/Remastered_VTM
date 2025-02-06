import { Injectable, UnauthorizedException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/login.dto/register.dto';
import { User } from 'src/user/entities/user/user';
import { AssignTaskDto } from './AssignTask.dto';
import { TaskService } from 'src/task/task.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly taskService: TaskService, // Inject TaskService
  ) {}

  // Validate user credentials (username/password)
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Compare password hash with the entered password
    const isMatch = await bcrypt.compare(pass, user.password);
    
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    // Return the user data without the password
    const { password, ...result } = user;
    return result;
  }

  // Generate JWT and log the user in
  async login(user: any) {
    if (!user) {
        throw new UnauthorizedException('User not found');
    }

    const payload = { 
        userId: user.userId,  
        username: user.username, 
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        googleUserId: user.googleUserId || null,
        profileImage: user.profileImage, // Include profileImage in payload
    };

    // Generate the JWT token
    return {
        access_token: this.jwtService.sign(payload),
        userId: user.userId, 
        username: user.username,
        user: {
            userId: user.userId,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            googleUserId: user.googleUserId || null,
            profileImage: user.profileImage, // Ensure profileImage is returned
        }
    };
  }

  // Register a new user (hash the password before storing)
  async register(registerDto: RegisterDto) {
    const { password, ...rest } = registerDto;
    
    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the new user in the database
    const newUser = await this.userService.create({
      ...rest,  
      password: hashedPassword,
      profileImage: rest.profileImage || '', // Ensure profileImage is handled
    });

    // Return user data without password
    const { password: _, ...result } = newUser;
    return result;
  }

  // Check if a user already exists by email (for Google SSO)
  async checkIfUserExists(email: string): Promise<boolean> {
    const user = await this.userService.findByEmail(email);
    return user !== undefined;
  }

  // Handle Google login (check if the user exists, if not, create a new one)
  async googleLogin(profile: any) {
    const email = profile?.email;
    const googleUserId = profile?.googleId;
    
    // Ensure profileImage is set. If missing, set a default profile image.
    let profileImage = profile?.profileImage || '';
    
    // You can add a fallback default image if no image is provided
    if (!profileImage) {
        profileImage = 'https://example.com/default-profile-image.png'; // Replace with your default image URL
    }

    // console.log('Google Profile:', profile); // Debug log

    // Validate email and googleUserId
    if (!email || !googleUserId) {
        throw new UnauthorizedException('Google profile does not contain email or user ID');
    }

    // Check if the user exists by email
    return this.userService.findByEmail(email)
        .then(async (user) => {
            if (!user) {
                // If no user exists, create a new one
                const extractedUsername = email.replace(/@gmail\.com$/, ''); 

                user = await this.userService.create({
                    username: extractedUsername,
                    firstname: profile.firstName?.trim() || 'FirstName',
                    lastname: profile.lastName?.trim() || 'LastName',
                    email: email,
                    password: null,  
                    googleUserId: googleUserId,
                    profileImage: profileImage, // Store Google profile image or default image
                });

                // console.log('New User Created:', user); // Debug new user creation
            }

            return this.login(user);
        })
        .catch((error) => {
            console.error('Google login error:', error);
            throw new UnauthorizedException('Google login failed');
        });
}


  // Validate admin credentials
  async validateAdmin(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (email !== adminEmail || password !== adminPassword) {
      throw new Error('Invalid email or password');
    }
    
    // Hardcoded admin user object
    const adminUser: Omit<User, 'password'> = {
      userId: 'admin-uuid',
      firstname: 'Admin',
      lastname: 'User',
      username: 'admin',
      role: 'admin' as 'admin',
      googleId: '', // Use googleId instead of googleUserId
      email: adminEmail,
      tasks: [],
      profileImage: '', // Ensure profileImage is present
    };
  
    return adminUser;
  }
  
  // Generate JWT token for the authenticated admin
  async loginAdmin(user: Omit<User, 'password'>) {
    const payload = { userId: user.userId, username: user.username, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    return { access_token: accessToken };
  }

  // Fetch all users with tasks for the admin
  async findAllUsersWithTasks() {
    return this.userService.findAllUsersWithTasks();
  }

  // Assign a task to a user
  async assignTaskToUser(userId: string, taskId: string) {
    return this.taskService.assignTaskToUser(userId, taskId);
  }
}
