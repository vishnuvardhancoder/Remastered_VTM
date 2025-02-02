import { Controller, Post, Body, UnauthorizedException, Get, Req, Res, UseGuards, NotFoundException, Param, BadRequestException, Patch, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto/login.dto';
import { RegisterDto } from './dto/login.dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { AdminLoginDto } from './dto/AdminLogin.dto';
import { Roles } from './role.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { AssignTaskDto } from './AssignTask.dto';
import { User } from 'src/user/entities/user/user';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  /**
   * Handles user login with username and password.
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Ensure the password has at least 6 characters
    if (!loginDto.password || loginDto.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    // Validate user credentials
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate the JWT token
    const tokenObject = await this.authService.login(user);

    // Return the access_token, userId, and username
    return {
      access_token: tokenObject.access_token,
      userId: user.userId.toString(),  // Ensure the userId is returned as a string
      username: user.username, // Add username to the response
      user: tokenObject.user,
    };
  }

  /**
   * Handles user registration.
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
      .then((user) => {
        return { message: 'User registered successfully', user };
      })
      .catch((error) => {
        throw new UnauthorizedException('Registration failed');
      });
  }

  /**
   * Initiates Google OAuth login.
   * Redirects user to Google's OAuth page.
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // This is where the OAuth process starts. No need to do anything else
    console.log('Redirecting to Google OAuth');
  }

  /**
   * Handles Google OAuth callback after user authentication.
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Get('google/redirect')
  async googleAuthRedirect(@Req() req, @Res() res) {
    const googleUser = req.user; // User object from Google strategy
    // console.log('Google User:', googleUser); // Log Google User

    // Try to find the user by googleId first, then by email
    this.userService.findByGoogleId(googleUser.googleId)
      .then(async (existingUser) => {
        let accessToken: string;
        let googleUserId: string;
        let internalUserId: string;  // Variable to hold the internal user ID
        let username: string;  // Variable to hold username

        if (existingUser) {
          // Existing user, generate JWT token
          accessToken = (await this.authService.googleLogin(existingUser)).access_token;
          googleUserId = existingUser.googleId; // Use the existing user's googleId
          internalUserId = existingUser.userId.toString(); // Cast internal user ID to string
          username = existingUser.username;  // Get username
        } else {
          // New user, create an account and generate JWT token
          const newUser = await this.authService.register({
            username: googleUser.email,
            email: googleUser.email,
            firstname: googleUser.firstName || '',
            lastname: googleUser.lastName || '',
            password: '', // No password needed for Google users
            googleId: googleUser.googleId, // Store the googleId in DB
          });
          accessToken = (await this.authService.googleLogin(newUser)).access_token;
          googleUserId = newUser.googleId; // Use the newly created user's googleId
          internalUserId = newUser.userId.toString(); // Cast internal user ID to string
          username = newUser.username;  // Get username for new user
        }

        // console.log('Generated Access Token:', accessToken); // Log Access Token

        // Redirect with internalUserId, googleUserId, accessToken, and username
        const redirectUri = `http://localhost:3001/callback?access_token=${accessToken}&user_id=${internalUserId}&google_user_id=${googleUserId}&username=${username}`;
        return res.redirect(redirectUri);
      })
      .catch((error) => {
        console.error('Error during Google authentication:', error);

        // Redirect to login with an error message
        return res.redirect('http://localhost:3001/login?error=authentication_failed');
      });
  }

  /**
   * Get the internal userId based on the Google User ID.
   */
  @Get('google/:googleUserId')
  async getInternalUserId(@Param('googleUserId') googleUserId: string) {
    const user = await this.userService.findByGoogleId(googleUserId);  // Use the UserService to find the user by Google ID
    if (!user) {
      throw new NotFoundException('User not found');  // Handle case where user doesn't exist
    }
    return { userId: user.userId.toString() };  // Ensure the userId is returned as a string
  }

  // Admin login route
  @Post('admin-login')
  async adminLogin(@Body() adminLoginDto: AdminLoginDto) {
    try {
      const user = await this.authService.validateAdmin(
        adminLoginDto.email,
        adminLoginDto.password,
      );
  
      if (!user) {
        throw new Error('Invalid credentials or not an admin');
      }
  
      return this.authService.loginAdmin(user);
    } catch (error) {
      // Send a detailed error message with HTTP status
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: error.message || 'Invalid email or password',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
  

 // Admin dashboard route (only accessible by authenticated admins)
 @UseGuards(JwtAuthGuard, RolesGuard) // Protect with JWT and Roles Guard
 @Roles('admin') // Only admin role is allowed to access this route
 @Get('admin-dashboard')
 async getAdminDashboard() {
   // Fetch and return the data for the admin dashboard
   return { message: 'Welcome to the Admin Dashboard!' };
 }

 // Route to fetch all users and their tasks for the admin dashboard
 @Get('admin/users')
 async getAllUsers() {
   return this.authService.findAllUsersWithTasks();
 }

 
  // Admin assigns a task to a user
  @Post('assign-task')
  async assignTaskToUser(@Body() assignTaskDto: AssignTaskDto) {
    const { userId, taskId } = assignTaskDto; // Destructure the DTO to get userId and taskId
    return this.authService.assignTaskToUser(userId, taskId); // Pass both arguments to the service method
  }

  
}
