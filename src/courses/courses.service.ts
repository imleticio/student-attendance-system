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

  findAll() {
    return `This action returns all courses`;
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
  private handleDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
