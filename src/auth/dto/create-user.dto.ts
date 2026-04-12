import { IsArray, IsBoolean, IsEmail, IsString, IsUUID, Matches, MaxLength, Min, MinLength } from "class-validator";
import { Entity, PrimaryGeneratedColumn } from "typeorm";


export class CreateUserDto {



    @IsEmail()
    @IsString()
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

    @IsString()
    @MinLength(4)
    fullName: string;



}
