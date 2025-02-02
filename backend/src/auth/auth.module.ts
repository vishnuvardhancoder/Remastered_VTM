import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.strategy/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { TaskModule } from 'src/task/task.module'; // Import TaskModule instead of TaskService

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // Default strategy for Passport is 'jwt'
    JwtModule.registerAsync({
      imports: [ConfigModule], // No need to import TaskService here
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Use env variable for JWT secret
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule, // Import ConfigModule for environment variables
    TaskModule, // Add TaskModule here to provide TaskService in AuthModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
