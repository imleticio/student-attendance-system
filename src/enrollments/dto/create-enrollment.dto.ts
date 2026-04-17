import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';

export class CreateEnrollmentDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  courseId: string;

  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;
}
