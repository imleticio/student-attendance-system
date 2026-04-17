import {
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ScanAttendanceDto {
  @IsString()
  qrToken: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  validationNotes?: string;
}
