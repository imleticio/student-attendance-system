export class Auth {}
import { IsArray, IsBoolean, IsEmail, IsString, IsUUID, Min } from "class-validator";
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    @IsUUID()
    id:string;

    @Column('text', {
        unique:true
    })
    email:string;

    @Column('text' , {
        select: false 
    })
    password:string;

    @Column('text')
    fullName:string;

    @Column('bool',{
        default:true //unique:true ? 
    })

    isActive:boolean;
    @Column('text',{
        array: true,
        default:['user']
    })
    roles:string[];

    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email = this.email.toLocaleLowerCase().trim()
    }

    @BeforeInsert()
    checkFieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert()
    }


}
