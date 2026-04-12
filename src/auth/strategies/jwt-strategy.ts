import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { JwtPayload } from "../interfaces";


import { User } from "../entities";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){ 
    constructor(
        @InjectRepository(User)
        private readonly userRepository:Repository<User>,

        configService:ConfigService
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

            secretOrKey:configService.get('JWT_SECRET'),

        });
    }

    async validate(payload:JwtPayload):Promise<User> {

        const {id} = payload;
        const user = await this.userRepository.findOneBy({id});
        if(!user)
            throw new UnauthorizedException('Token not valid')
        if(!user.isActive)
            throw new UnauthorizedException('User is inactive, talk with an admin ')
        
        return user;
    }
}