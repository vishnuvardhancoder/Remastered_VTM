import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET, // Ensure this is set in .env
    });
  }

  // Extract user details from the JWT payload
  async validate(payload: any) {
    console.log("🔍 JWT Payload:", payload); // Debugging

    return { 
      userId: payload.userId,  // ✅ Extract userId directly (fixed)
      username: payload.username,
      email: payload.email,
      firstname: payload.firstname,
      lastname: payload.lastname,
      googleUserId: payload.googleUserId || null,
    };
  }
}
