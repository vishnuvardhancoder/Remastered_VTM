// src/user/dto/create-user.dto.ts
import { IsNotEmpty, IsString, MinLength, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;  // Add email validation

  @IsOptional()  // Make googleUserId optional, as it's only relevant for Google login
  @IsString()
  googleUserId?: string;
}
