import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user/user';

@Module({
  imports: [TypeOrmModule.forFeature([User])],  // Import User entity here
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],  // Export UserService for use in other modules
})
export class UserModule {}
