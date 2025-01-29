import { User } from "src/user/entities/user/user";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column( { type: 'text', nullable: true})
    description: string;

    @Column({ default: false }) // This adds a 'deleted' column with a default value of 'false'
    deleted: boolean;

    @Column({ default: 'Not Started' }) // Default value as 'Not Started'
    status: string;

    @Column({ default: false})
    completed: boolean;         

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;  // Ensure this is automatically set to the current timestamp

    @ManyToOne(() => User, (user) => user.tasks, { nullable: false })  // Ensuring 'nullable' is set to false
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()  // Add this line
    userId: number;  // Link task to user
}       