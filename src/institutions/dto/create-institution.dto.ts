import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInstitutionDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsString()
  @MaxLength(30)
  code: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
