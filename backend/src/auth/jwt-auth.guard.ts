// src/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  canActivate(context: any) {
    // Custom logic to check the JWT token
    return super.canActivate(context);
  }
}
