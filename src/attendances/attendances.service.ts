import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { ScanAttendanceDto } from './dto/scan-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { Repository } from 'typeorm';
import { Class } from '../classes/entities/class.entity';
import { User } from '../auth/entities/user.entity';
import { AttendanceSession } from '../attendance-sessions/entities/attendance-session.entity';
import { ValidRoles } from '../auth/interfaces';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { EnrollmentStatus } from '../enrollments/enums/enrollment-status.enum';
import { JwtService } from '@nestjs/jwt';
import { AttendanceMethod } from './enums/attendance-method.enum';
import { AttendanceStatus } from './enums/attendance-status.enum';

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

    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,

    private readonly jwtService: JwtService,
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

  async scanWithQr(scanAttendanceDto: ScanAttendanceDto, student: User) {
    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(scanAttendanceDto.qrToken);
    } catch {
      throw new BadRequestException('QR token is invalid or expired');
    }

    if (
      payload.type !== 'attendance-qr' ||
      !payload.sessionId ||
      !payload.classId
    ) {
      throw new BadRequestException('QR token payload is invalid');
    }

    const session = await this.attendanceSessionRepository.findOne({
      where: { id: payload.sessionId },
      relations: {
        class: {
          course: true,
        },
      },
    });

    if (!session) {
      throw new NotFoundException(
        `Attendance session with id "${payload.sessionId}" not found`,
      );
    }

    if (session.class.id !== payload.classId) {
      throw new BadRequestException('QR token does not match session class');
    }

    if (
      !session.isActive ||
      session.closedAt ||
      session.expiresAt <= new Date()
    ) {
      throw new BadRequestException('Attendance session is not active');
    }

    const isInsideGeofence = this.isInsideGeofence(
      scanAttendanceDto.lat,
      scanAttendanceDto.lng,
      session.geoLat,
      session.geoLng,
      session.geoRadiusMeters,
    );

    if (!isInsideGeofence) {
      throw new BadRequestException(
        'You are outside the allowed attendance geofence',
      );
    }

    const activeEnrollment = await this.enrollmentRepository.findOne({
      where: {
        student: { id: student.id },
        course: { id: session.class.course.id },
        status: EnrollmentStatus.ACTIVE,
      },
    });

    if (!activeEnrollment) {
      throw new BadRequestException(
        `Student "${student.id}" is not actively enrolled in this course`,
      );
    }

    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        class: { id: session.class.id },
        student: { id: student.id },
      },
    });

    if (existingAttendance) {
      throw new BadRequestException(
        `Attendance already exists for student "${student.id}" in class "${session.class.id}"`,
      );
    }

    try {
      const attendance = this.attendanceRepository.create({
        class: session.class,
        student,
        attendanceSession: session,
        status: AttendanceStatus.PRESENT,
        method: AttendanceMethod.QR,
        markedAt: new Date(),
        validationNotes: scanAttendanceDto.validationNotes,
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

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  private isInsideGeofence(
    userLat: number,
    userLng: number,
    centerLat: number,
    centerLng: number,
    radiusMeters: number,
  ): boolean {
    const distanceMeters = this.calculateDistanceInMeters(
      userLat,
      userLng,
      centerLat,
      centerLng,
    );

    return distanceMeters <= radiusMeters;
  }

  private calculateDistanceInMeters(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): number {
    const earthRadiusMeters = 6371000;
    const dLat = this.degreesToRadians(toLat - fromLat);
    const dLng = this.degreesToRadians(toLng - fromLng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(fromLat)) *
        Math.cos(this.degreesToRadians(toLat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusMeters * c;
  }

  private degreesToRadians(value: number): number {
    return (value * Math.PI) / 180;
  }
}
