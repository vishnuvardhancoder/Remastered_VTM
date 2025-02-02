import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/login.dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
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
        userId: user.userId,  // 🔥 Ensure userId is explicitly set
        username: user.username, 
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        googleUserId: user.googleUserId || null,  // Include Google User ID if exists
    };

    // Generate the JWT token
    return {
        access_token: this.jwtService.sign(payload),
        userId: user.userId, // 🔥 Ensure userId is returned correctly
        username: user.username,
        user: {
            userId: user.userId,  // 🔥 Use userId consistently
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            googleUserId: user.googleUserId || null,
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
    });

    // Return user data without password
    const { password: _, ...result } = newUser;
    return result;
  }

  // Check if a user already exists by email (for Google SSO)
  async checkIfUserExists(email: string): Promise<boolean> {
    const user = await this.userService.findByEmail(email); // Assuming `findByEmail` is available in `UserService`
    return user !== undefined;
  }

  // Handle Google login (check if the user exists, if not, create a new one)
  async googleLogin(profile: any) {
    const email = profile?.email;
    const googleUserId = profile?.googleId;  // Ensure `googleId` is part of the profile
  
    console.log('Google Profile:', profile); // Log the profile for debugging
    
    if (!email || !googleUserId) {
      throw new UnauthorizedException('Google profile does not contain email or user ID');
    }
  
    return this.userService.findByEmail(email)
      .then(async (user) => {
        if (!user) {
          // Create a new user using the Google profile information
          user = await this.userService.create({
            username: email.split('@')[0], // Derive username from email
            firstname: profile.firstName?.trim() || 'FirstName',
            lastname: profile.lastName?.trim() || 'LastName',
            email: email,
            password: null,  // Google users do not have a password
            googleUserId: googleUserId, // Store Google User ID in the database
          });
        }
  
        // Return the login response with the internal user ID included
        return this.login(user); // Now this will return the token as a string
      })
      .catch((error) => {
        console.error('Google login error:', error);
        throw new UnauthorizedException('Google login failed');
      });
  }
  
}
