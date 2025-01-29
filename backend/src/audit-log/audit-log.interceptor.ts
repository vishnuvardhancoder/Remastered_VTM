import {CallHandler,ExecutionContext,Injectable,NestInterceptor,} from '@nestjs/common';
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
      const userId = request.user?.userId || null; // Get user ID if authenticated
  
      let requestData = { ...request.body };
  
      // Remove sensitive data
      if (requestData.password) delete requestData.password;
      if (requestData.token) delete requestData.token;
  
      return next.handle().pipe(
        map(async (responseData) => {
          const auditLog = this.auditLogRepository.create({
            endpoint,
            method,
            requestData,
            responseData,
            userId,
            ipAddress,
          });
          await this.auditLogRepository.save(auditLog);
  
          return responseData; // Continue returning the original response
        }),
      );
    }
  }
  