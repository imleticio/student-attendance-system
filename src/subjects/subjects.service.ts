import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class SubjectsService {
  private readonly logger = new Logger('SubjectsService');

  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async create(createSubjectDto: CreateSubjectDto) {
    try {
      const code =
        createSubjectDto.code?.trim().toUpperCase() ??
        (await this.generateUniqueCode(createSubjectDto.name));

      const {institution_id , ...subjectDto} =createSubjectDto
      
      const subject = this.subjectRepository.create({
        ...subjectDto,
        code,
        institution:{id:institution_id}
      });

      await this.subjectRepository.save(subject);

      return subject;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto:PaginationDto) {
    const {limit = 10, offset=0}=paginationDto;
    const subjects = await this.subjectRepository.find({
      take:limit,
      skip:offset,

    })
    return subjects.map((subject) => ({
        subject
    }))
  }

  async findOne(term: string): Promise<Subject> {
    let subject: Subject | null = null;

    if (isUUID(term)) {
      subject = await this.subjectRepository.findOneBy({ id: term });
    } else {
      subject = await this.subjectRepository
        .createQueryBuilder('subj')
        .where('UPPER(subj.name) = :name OR UPPER(subj.code) = :code', {
          name: term.toUpperCase(),
          code: term.toUpperCase(),
        })
        .getOne();
    }

    if (!subject) {
      throw new NotFoundException(
        `Subject with identifier "${term}" not found`,
      );
    }

    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Invalid subject ID format: "${id}"`);
    }

    const toUpdate = {
      ...updateSubjectDto,
      code: updateSubjectDto.code?.trim().toUpperCase(),
    };

    const subject = await this.subjectRepository.preload({ id, ...toUpdate });

    if (!subject) {
      throw new NotFoundException(`Subject with id "${id}" not found`);
    }

    try {
      await this.subjectRepository.save(subject);
      return subject;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} subject`;
  }

  private async generateUniqueCode(name: string): Promise<string> {
    const normalizedName = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    const prefix = (normalizedName || 'SUBJ').slice(0, 6);

    for (let attempt = 0; attempt < 10; attempt++) {
      const suffix = randomBytes(2).toString('hex').toUpperCase();
      const candidate = `${prefix}-${suffix}`;
      const existingSubject = await this.subjectRepository.findOneBy({
        code: candidate,
      });

      if (!existingSubject) {
        return candidate;
      }
    }

    throw new InternalServerErrorException(
      'Could not generate a unique subject code',
    );
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
