import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { AttendanceStatus } from '../enums/attendance-status.enum';
import { AttendanceMethod } from '../enums/attendance-method.enum';

export class CreateAttendanceDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  studentId: string;

  @IsUUID()
  @IsOptional()
  attendanceSessionId?: string;

  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @IsEnum(AttendanceMethod)
  @IsOptional()
  method?: AttendanceMethod;

  @IsDateString()
  @IsOptional()
  markedAt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  validationNotes?: string;
}
