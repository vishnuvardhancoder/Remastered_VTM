import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Extract the JWT token from Authorization header
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,  // Ensure this is set in your .env file
    });
  }

  // Extract user details from the JWT payload
  async validate(payload: any) {
    // console.log("🔍 JWT Payload:", payload); // Debugging

    return { 
      userId: payload.userId,  // ✅ Extract userId directly from payload
      username: payload.username,
      role: payload.role,  // Extract role for RBAC (role-based access control)
      email: payload.email,  // Optional - include email if necessary
      firstname: payload.firstname,
      lastname: payload.lastname,
      googleUserId: payload.googleUserId || null, // Google user ID if applicable
    };
  }
}
