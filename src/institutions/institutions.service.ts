import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Institution } from './entities/institution.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { toUnicode } from 'node:punycode';

@Injectable()
export class InstitutionsService {
  private readonly logger = new Logger('InstitutionsService');

  constructor(
    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,
  ) {}

 async create(createInstitutionDto: CreateInstitutionDto): Promise<Institution> {
  try {
    const institution = this.institutionRepository.create({
      ...createInstitutionDto,
      name: createInstitutionDto.name.trim(),
      code: createInstitutionDto.code.trim().toUpperCase(),
    });

    await this.institutionRepository.save(institution);
    return institution;
  } catch (error) {
    this.handleDBExceptions(error);
  }
}


  async findAll(paginationDto:PaginationDto) {
     const {limit = 10, offset=0}=paginationDto;
    const institution = await this.institutionRepository.find({
      take:limit,
      skip:offset,

    })
    return institution.map((institution) => ({
        institution
    }))
  }

  async findOne(term: string) {
    let institution: Institution | null = null;
    if(isUUID(term)){
      institution= await this.institutionRepository.findOneBy({id:term});
      
    }else{
      institution = await this.institutionRepository
        .createQueryBuilder('inst')
        .where('UPPER(inst.name) =:name or UPPER(inst.code)=:code',{
          name: term.toUpperCase(),
          code:term.toUpperCase()
        })
        .getOne()
    }
    if (!institution) {
      throw new NotFoundException(
        `Subject with identifier "${term}" not found`,
      );
    }

    return institution;

  }

  async update(id: string, updateInstitutionDto: UpdateInstitutionDto) {
    if(!isUUID(id)){
      throw new BadRequestException(`Invalid subject ID format : "${id}"`)
    }

    const toUpdate={
      ...updateInstitutionDto,
      code:updateInstitutionDto.code?.trim().toUpperCase()
    };
    const institution = await this.institutionRepository.preload({id,...toUpdate});
    if(!institution){
      throw new NotFoundException(`Subject with id "${id} not found"`)
    }

    try {

      await this.institutionRepository.save(institution)
      return institution;
      
    } catch (error) {
        this.handleDBExceptions(error)
    }
    
  }


  remove(id: number) {
    return `This action removes a #${id} institution`;
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
