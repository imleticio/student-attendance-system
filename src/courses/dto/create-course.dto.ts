
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";

export class CreateCourseDto {

    @IsString()
    @MaxLength(150)
    name: string;

    @IsInt()
    @Min(2000)
    year: number;

    @IsInt()
    @Min(1)
    semester: number;

    @IsString()
    @IsOptional()
    schedule?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsUUID()
    subjectId: string;

    @IsUUID()
    teacherId: string;

}
