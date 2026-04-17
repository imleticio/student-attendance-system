import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { ValidRoles } from '../auth/interfaces';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger('EnrollmentsService');

  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const { studentId, courseId, ...enrollmentDetails } = createEnrollmentDto;

    const student = await this.userRepository.findOneBy({ id: studentId });
    if (!student) {
      throw new NotFoundException(`Student with id "${studentId}" not found`);
    }

    if (student.role !== ValidRoles.STUDENT) {
      throw new BadRequestException(
        `User with id "${studentId}" does not have student role`,
      );
    }

    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) {
      throw new NotFoundException(`Course with id "${courseId}" not found`);
    }

    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        student: { id: studentId },
        course: { id: courseId },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException(
        `Student "${studentId}" is already enrolled in course "${courseId}"`,
      );
    }

    try {
      const enrollment = this.enrollmentRepository.create({
        ...enrollmentDetails,
        student,
        course,
      });

      await this.enrollmentRepository.save(enrollment);

      return await this.enrollmentRepository.findOne({
        where: { id: enrollment.id },
        relations: {
          student: true,
          course: true,
        },
      });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return await this.enrollmentRepository.find({
      take: limit,
      skip: offset,
      relations: {
        student: true,
        course: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string | number) {
    const normalizedId = String(id).trim();

    if (!isUUID(normalizedId)) {
      throw new BadRequestException(
        `Invalid enrollment ID format: "${normalizedId}"`,
      );
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: normalizedId },
      relations: {
        student: true,
        course: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment with id "${normalizedId}" not found`,
      );
    }

    return enrollment;
  }

  update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    return `This action updates a #${id} enrollment`;
  }

  remove(id: number) {
    return `This action removes a #${id} enrollment`;
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
}
