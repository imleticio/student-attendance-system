import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Class } from './entities/class.entity';
import { Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class ClassesService {
  private readonly logger = new Logger('ClassesService');

  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createClassDto: CreateClassDto) {
    const { courseId, createdById, ...classDetails } = createClassDto;

    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) {
      throw new NotFoundException(`Course with id "${courseId}" not found`);
    }

    const createdBy = await this.userRepository.findOneBy({ id: createdById });
    if (!createdBy) {
      throw new NotFoundException(`User with id "${createdById}" not found`);
    }

    if (
      createdBy.role !== ValidRoles.TEACHER &&
      createdBy.role !== ValidRoles.ADMIN
    ) {
      throw new BadRequestException(
        `User with id "${createdById}" cannot create classes`,
      );
    }

    const start = this.timeToMinutes(classDetails.startTime);
    const end = this.timeToMinutes(classDetails.endTime);
    if (end <= start) {
      throw new BadRequestException('endTime must be greater than startTime');
    }

    try {
      const classEntity = this.classRepository.create({
        ...classDetails,
        course,
        createdBy,
      });

      await this.classRepository.save(classEntity);

      return await this.classRepository.findOne({
        where: { id: classEntity.id },
        relations: {
          course: true,
          createdBy: true,
        },
      });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return await this.classRepository.find({
      take: limit,
      skip: offset,
      relations: {
        course: true,
        createdBy: true,
      },
      order: {
        classDate: 'DESC',
        startTime: 'DESC',
      },
    });
  }

  async findOne(id: string | number) {
    const normalizedId = String(id).trim();

    if (!isUUID(normalizedId)) {
      throw new BadRequestException(
        `Invalid class ID format: "${normalizedId}"`,
      );
    }

    const classEntity = await this.classRepository.findOne({
      where: { id: normalizedId },
      relations: {
        course: true,
        createdBy: true,
      },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with id "${normalizedId}" not found`);
    }

    return classEntity;
  }

  update(id: number, updateClassDto: UpdateClassDto) {
    return `This action updates a #${id} class`;
  }

  remove(id: number) {
    return `This action removes a #${id} class`;
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
