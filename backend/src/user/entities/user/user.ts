import { IsEmail, IsNotEmpty } from 'class-validator';
import { Task } from 'src/task/task.entity';
import {Entity,PrimaryGeneratedColumn,Column,OneToMany} from 'typeorm';

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({unique: true})
    username: string;

    @Column({ length: 72 }) // Specifically for bcrypt hashes
    password: string;

    @Column({ default: 'user' })  // Default role is 'user'
  role: string; // 'admin' or 'user'

  @Column({ nullable: true })  // Make googleUserId nullable
  googleId: string | null;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  

    @OneToMany(()=> Task, (task)=> task.user)
    tasks: Task[]
}
