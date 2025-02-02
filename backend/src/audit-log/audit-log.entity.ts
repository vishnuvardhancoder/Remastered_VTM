import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid') // Use UUID instead of number
  auditLogId: string; // Renamed from `id` to `auditLogId`

  @Column()
  endpoint: string; // API URL

  @Column({ nullable: true })
  method: string; // GET, POST, PUT, DELETE

  @Column({ type: 'json' })
  requestData: any; // Stores request data

  @Column({ type: 'json', nullable: true })
  responseData: any; // Stores response data

  @Column({ type: 'uuid', nullable: true }) // Ensure userId is a UUID
  userId?: string; 

  @Column({ nullable: true })
  ipAddress?: string; // IP address of the user

  @CreateDateColumn()
  timestamp: Date; // Stores when the API was called
}
