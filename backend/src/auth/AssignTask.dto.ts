import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignTaskDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  taskId: string;
}
