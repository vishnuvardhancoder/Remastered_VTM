import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  endpoint: string; // API URL

  @Column({ nullable: true })
  method: string; // GET, POST, PUT, DELETE

  @Column({ type: 'json' })
  requestData: any; // Stores request data

  @Column({ type: 'json', nullable: true })
  responseData: any; // Stores response data
  @Column({ nullable: true })
  userId?: number; // User ID if authenticated

  @Column({ nullable: true })
  ipAddress?: string; // IP address of the user

  @CreateDateColumn()
  timestamp: Date; // Stores when the API was called
}
