import { IsEmail, IsNotEmpty } from 'class-validator';
import { Task } from 'src/task/task.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') // Use UUID instead of number
  userId: string; // Renamed from `id` to `userId`

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ unique: true })
  username: string;

  @Column({ length: 72 }) // Specifically for bcrypt hashes
  password: string;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' }) // Enforce role values
  role: 'user' | 'admin';

  @Column({ nullable: true, unique: true }) // Make googleId nullable and unique
  googleId: string | null;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @OneToMany(() => Task, (task) => task.user, { cascade: true }) // Ensure user-task relationship
  tasks: Task[];
}
