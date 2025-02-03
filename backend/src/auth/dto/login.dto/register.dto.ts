// src/auth/dto/register.dto.ts

import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  firstname: string;

  @IsString()
  @IsNotEmpty()
  // @MinLength(3)
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional() // googleId is optional as not all users will log in with Google
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;  // Add this field

}
