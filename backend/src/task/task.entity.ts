import { User } from "src/user/entities/user/user";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";

@Entity()
export class Task {
    @PrimaryGeneratedColumn('uuid') // Use UUID instead of number
    taskId: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: false })
    deleted: boolean;

    @Column({ default: 'Not Started' })
    status: string;

    @Column({ default: false })
    completed: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true }) // Add deadline, but it's nullable for user-created tasks
    deadline: Date;

    // ManyToOne relationship to User, nullable: false as the task should always be assigned to a user
    @ManyToOne(() => User, (user) => user.tasks, { nullable: false })
    @JoinColumn({ name: 'userId' })
    user: User;

    // userId is a required field and will store the specific user's ID
    @Column({ type: 'uuid' })
    userId: string;
}
