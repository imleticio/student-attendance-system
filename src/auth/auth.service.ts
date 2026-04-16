import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { throws } from 'assert';
import { JwtPayload } from './interfaces';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService:JwtService

  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, institution_id ,...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
        institution:{id:institution_id}
      });

      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
      };
    } catch (error) {
      this.handleDBError(error);
    }
  }
  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email: email.toLocaleLowerCase() },
      select: { email: true, password: true, id: true },
    });
    if (!user)
      throw new UnauthorizedException('credential are not valid (email)');
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)');

    return {
      ...user,
      token:this.getJwToken({id: user.id})

    };
  }

   private getJwToken(payload: JwtPayload){
    //generar el token 
      const token = this.jwtService.sign(payload);
      return token;
  }
  

  private handleDBError(error: any): never {
    if ((error.code = '23505')) throw new BadRequestException(error.detail);
    console.log(error);
    throw new InternalServerErrorException('please check server logs ');
  }
}
