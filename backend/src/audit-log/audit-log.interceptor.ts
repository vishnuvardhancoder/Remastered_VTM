import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const endpoint = request.url;
    const method = request.method;
    const ipAddress = request.ip;

    // Determine the user ID to log
    let userId = request.user?.userId || null; // Get user ID if authenticated
    const assignedUserId = request.body?.assignedUserId; // Check if an assigned user ID exists in the body

    // If it's an assignment task and there's an assignedUserId, use that instead
    if (assignedUserId && assignedUserId !== 'admin-uuid') {
      userId = assignedUserId; // Log the assigned user's ID instead of the admin's
    }

    let requestData = { ...request.body };

    // Remove sensitive data
    if (requestData.password) delete requestData.password;
    if (requestData.token) delete requestData.token;

    return next.handle().pipe(
      map(async (responseData) => {
        // Create an audit log entry
        const auditLog = this.auditLogRepository.create({
          endpoint,
          method,
          requestData,
          responseData,
          userId,  // Make sure to log the correct user ID
          ipAddress,
        });
        await this.auditLogRepository.save(auditLog);

        return responseData; // Continue returning the original response
      }),
    );
  }
}
