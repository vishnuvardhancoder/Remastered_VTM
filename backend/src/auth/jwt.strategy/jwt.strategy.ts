import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,  // Replace with process.env.JWT_SECRET in production
      passReqToCallback: true,     // Ensure the request object is passed to the validate method
    });
  }

  // This method will be used to extract the user information from the JWT payload
  async validate(req: any, payload: any) {
    // Adding user info (userId, username, googleUserId) to the request object
    // console.log('Decoded JWT Payload:', payload); // Check if `sub` (user ID) is available in the payload
    req.user = { 
      userId: payload.sub,  // The user ID in your system
      username: payload.username, // The username in your system
      googleUserId: payload.googleUserId, // The Google user ID from OAuth (added in JWT)
    };
    
    return req.user;  // Returning user data to be available in the request
  }
}
