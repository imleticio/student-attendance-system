import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';
import { Subject } from '../subjects/entities/subject.entity';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    const { subjectId, teacherId, ...courseDetails } = createCourseDto;

    const subject = await this.subjectRepository.findOneBy({ id: subjectId });
    if (!subject) {
      throw new NotFoundException(`Subject with id "${subjectId}" not found`);
    }

    const teacher = await this.userRepository.findOneBy({ id: teacherId });
    if (!teacher) {
      throw new NotFoundException(`Teacher with id "${teacherId}" not found`);
    }

    if (teacher.role !== ValidRoles.TEACHER) {
      throw new BadRequestException(
        `User with id "${teacherId}" does not have teacher role`,
      );
    }
    // Multi-institution rule: when this validation is implemented, load
    // subject.institution and teacher.institution and ensure both IDs match
    // before creating the course.
    try {
      const course = this.courseRepository.create({
        ...courseDetails,
        subject,
        teacher,
      });

      await this.courseRepository.save(course);

      return await this.courseRepository.findOne({
        where: { id: course.id },
        relations: {
          subject: true,
          teacher: true,
        },
      });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const courses = await this.courseRepository.find({
      take: limit,
      skip: offset,
      relations: {
        subject: true,
        teacher: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return courses;
  }

  async findOne(term: string) {
    const normalizedTerm = term.trim();
    let course: Course | null = null;

    if (isUUID(normalizedTerm)) {
      course = await this.courseRepository.findOne({
        where: { id: normalizedTerm },
        relations: {
          subject: true,
          teacher: true,
        },
      });
    } else {
      const courses = await this.courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.subject', 'subject')
        .leftJoinAndSelect('course.teacher', 'teacher')
        .where('LOWER(course.name) = LOWER(:name)', {
          name: normalizedTerm,
        })
        .take(2)
        .getMany();

      if (courses.length > 1) {
        throw new BadRequestException(
          `Multiple courses found for "${normalizedTerm}". Use course UUID instead.`,
        );
      }

      course = courses[0] ?? null;
    }

    if (!course) {
      throw new NotFoundException(`Course with identifier "${term}" not found`);
    }

    return course;
  }

  async update(id: string | number, updateCourseDto: UpdateCourseDto) {
    const normalizedId = String(id).trim();

    if (!isUUID(normalizedId)) {
      throw new BadRequestException(
        `Invalid course ID format: "${normalizedId}"`,
      );
    }

    const { subjectId, teacherId, ...courseDetails } = updateCourseDto;

    const course = await this.courseRepository.findOne({
      where: { id: normalizedId },
      relations: {
        subject: true,
        teacher: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with id "${normalizedId}" not found`);
    }

    if (subjectId) {
      const subject = await this.subjectRepository.findOneBy({ id: subjectId });

      if (!subject) {
        throw new NotFoundException(`Subject with id "${subjectId}" not found`);
      }

      course.subject = subject;
    }

    if (teacherId) {
      const teacher = await this.userRepository.findOneBy({ id: teacherId });

      if (!teacher) {
        throw new NotFoundException(`Teacher with id "${teacherId}" not found`);
      }

      if (teacher.role !== ValidRoles.TEACHER) {
        throw new BadRequestException(
          `User with id "${teacherId}" does not have teacher role`,
        );
      }

      course.teacher = teacher;
    }

    this.courseRepository.merge(course, courseDetails);

    try {
      await this.courseRepository.save(course);

      return await this.courseRepository.findOne({
        where: { id: course.id },
        relations: {
          subject: true,
          teacher: true,
        },
      });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
