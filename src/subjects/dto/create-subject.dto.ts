import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateSubjectDto {

    @IsString()
    @MaxLength(150)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    code?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

}
