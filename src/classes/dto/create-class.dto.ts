import {
  IsDateString,
  IsEnum,
  IsMilitaryTime,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ClassStatus } from '../enums/class-status.enum';

export class CreateClassDto {
  @IsUUID()
  courseId: string;

  @IsUUID()
  createdById: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  title?: string;

  @IsString()
  @IsOptional()
  topic?: string;

  @IsDateString()
  classDate: string;

  @IsMilitaryTime()
  startTime: string;

  @IsMilitaryTime()
  endTime: string;

  @IsEnum(ClassStatus)
  @IsOptional()
  status?: ClassStatus;
}
