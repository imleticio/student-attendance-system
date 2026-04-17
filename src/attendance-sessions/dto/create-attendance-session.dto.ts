import {
  IsDateString,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsPositive,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateAttendanceSessionDto {
  @IsUUID()
  classId: string;

  @IsLatitude()
  geoLat: number;

  @IsLongitude()
  geoLng: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @Min(10)
  @Max(1000)
  geoRadiusMeters?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @Min(10)
  @Max(60)
  qrRotationSeconds?: number;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @Min(1)
  @Max(300)
  durationMinutes?: number;
}
