import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { Repository } from 'typeorm';
import { Class } from '../classes/entities/class.entity';
import { User } from '../auth/entities/user.entity';
import { AttendanceSession } from '../attendance-sessions/entities/attendance-session.entity';
import { ValidRoles } from '../auth/interfaces';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class AttendancesService {
  private readonly logger = new Logger('AttendancesService');

  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(AttendanceSession)
    private readonly attendanceSessionRepository: Repository<AttendanceSession>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    const {
      classId,
      studentId,
      attendanceSessionId,
      markedAt,
      ...attendanceDetails
    } = createAttendanceDto;

    const classEntity = await this.classRepository.findOneBy({ id: classId });
    if (!classEntity) {
      throw new NotFoundException(`Class with id "${classId}" not found`);
    }

    const student = await this.userRepository.findOneBy({ id: studentId });
    if (!student) {
      throw new NotFoundException(`Student with id "${studentId}" not found`);
    }

    if (student.role !== ValidRoles.STUDENT) {
      throw new BadRequestException(
        `User with id "${studentId}" does not have student role`,
      );
    }

    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        class: { id: classId },
        student: { id: studentId },
      },
      relations: {
        class: true,
        student: true,
      },
    });

    if (existingAttendance) {
      throw new BadRequestException(
        `Attendance already exists for student "${studentId}" in class "${classId}"`,
      );
    }

    let attendanceSession: AttendanceSession | null = null;

    if (attendanceSessionId) {
      attendanceSession = await this.attendanceSessionRepository.findOne({
        where: { id: attendanceSessionId },
        relations: {
          class: true,
        },
      });

      if (!attendanceSession) {
        throw new NotFoundException(
          `Attendance session with id "${attendanceSessionId}" not found`,
        );
      }

      if (attendanceSession.class.id !== classId) {
        throw new BadRequestException(
          `Attendance session "${attendanceSessionId}" does not belong to class "${classId}"`,
        );
      }
    }

    try {
      const attendance = this.attendanceRepository.create({
        ...attendanceDetails,
        markedAt: markedAt ? new Date(markedAt) : new Date(),
        class: classEntity,
        student,
        attendanceSession,
      });

      await this.attendanceRepository.save(attendance);

      return await this.attendanceRepository.findOne({
        where: { id: attendance.id },
        relations: {
          class: true,
          student: true,
          attendanceSession: true,
        },
      });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const attendances = await this.attendanceRepository.find({
      take: limit,
      skip: offset,
      relations: {
        class: true,
        student: true,
        attendanceSession: true,
      },
      order: {
        markedAt: 'DESC',
      },
    });

    return attendances;
  }

  async findOne(id: string | number) {
    const normalizedId = String(id).trim();

    if (!isUUID(normalizedId)) {
      throw new BadRequestException(
        `Invalid attendance ID format: "${normalizedId}"`,
      );
    }

    const attendance = await this.attendanceRepository.findOne({
      where: { id: normalizedId },
      relations: {
        class: true,
        student: true,
        attendanceSession: true,
      },
    });

    if (!attendance) {
      throw new NotFoundException(
        `Attendance with id "${normalizedId}" not found`,
      );
    }

    return attendance;
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
