import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttendanceSessionDto } from './dto/create-attendance-session.dto';
import { UpdateAttendanceSessionDto } from './dto/update-attendance-session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceSession } from './entities/attendance-session.entity';
import { Repository } from 'typeorm';
import { Class } from '../classes/entities/class.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AttendanceSessionsService {
  private readonly logger = new Logger('AttendanceSessionsService');

  constructor(
    @InjectRepository(AttendanceSession)
    private readonly attendanceSessionRepository: Repository<AttendanceSession>,

    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,

    private readonly jwtService: JwtService,
  ) {}

  async create(createAttendanceSessionDto: CreateAttendanceSessionDto) {
    const {
      classId,
      expiresAt,
      durationMinutes = 90,
      geoRadiusMeters = 120,
      qrRotationSeconds = 10,
      ...geoDetails
    } = createAttendanceSessionDto;

    const classEntity = await this.classRepository.findOneBy({ id: classId });
    if (!classEntity) {
      throw new NotFoundException(`Class with id "${classId}" not found`);
    }

    const now = new Date();
    const activeSession = await this.attendanceSessionRepository
      .createQueryBuilder('session')
      .leftJoin('session.class', 'class')
      .where('class.id = :classId', { classId })
      .andWhere('session.isActive = true')
      .andWhere('session.closedAt IS NULL')
      .andWhere('session.expiresAt > :now', { now })
      .getOne();

    if (activeSession) {
      throw new BadRequestException(
        `Class "${classId}" already has an active attendance session`,
      );
    }

    const openedAt = new Date();
    const resolvedExpiresAt = expiresAt
      ? new Date(expiresAt)
      : new Date(openedAt.getTime() + durationMinutes * 60 * 1000);

    if (resolvedExpiresAt <= openedAt) {
      throw new BadRequestException('expiresAt must be a future date');
    }

    const session = this.attendanceSessionRepository.create({
      ...geoDetails,
      geoRadiusMeters,
      qrRotationSeconds,
      class: classEntity,
      token: randomBytes(32).toString('hex'),
      openedAt,
      expiresAt: resolvedExpiresAt,
      isActive: true,
    });

    await this.attendanceSessionRepository.save(session);

    return await this.attendanceSessionRepository.findOne({
      where: { id: session.id },
      relations: {
        class: true,
      },
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return await this.attendanceSessionRepository.find({
      take: limit,
      skip: offset,
      relations: {
        class: true,
      },
      order: {
        openedAt: 'DESC',
      },
    });
  }

  async findOne(id: string | number) {
    const normalizedId = String(id).trim();

    if (!isUUID(normalizedId)) {
      throw new BadRequestException(
        `Invalid attendance session ID format: "${normalizedId}"`,
      );
    }

    const session = await this.attendanceSessionRepository.findOne({
      where: { id: normalizedId },
      relations: {
        class: true,
      },
    });

    if (!session) {
      throw new NotFoundException(
        `Attendance session with id "${normalizedId}" not found`,
      );
    }

    return session;
  }

  async getQrToken(id: string | number) {
    const session = await this.findOne(id);

    if (
      !session.isActive ||
      session.closedAt ||
      session.expiresAt <= new Date()
    ) {
      throw new BadRequestException('Attendance session is not active');
    }

    const expiresInSeconds = session.qrRotationSeconds || 10;
    const token = await this.jwtService.signAsync(
      {
        type: 'attendance-qr',
        sessionId: session.id,
        classId: session.class.id,
        nonce: randomBytes(8).toString('hex'),
      },
      {
        subject: session.id,
        expiresIn: `${expiresInSeconds}s`,
      },
    );

    return {
      token,
      expiresInSeconds,
    };
  }

  async close(id: string | number) {
    const session = await this.findOne(id);

    if (!session.closedAt) {
      session.closedAt = new Date();
    }

    session.isActive = false;
    await this.attendanceSessionRepository.save(session);

    return session;
  }

  async update(
    id: string | number,
    updateAttendanceSessionDto: UpdateAttendanceSessionDto,
  ) {
    const session = await this.findOne(id);
    const { classId, expiresAt, durationMinutes, ...sessionDetails } =
      updateAttendanceSessionDto;

    if (classId && classId !== session.class.id) {
      const classEntity = await this.classRepository.findOneBy({ id: classId });
      if (!classEntity) {
        throw new NotFoundException(`Class with id "${classId}" not found`);
      }

      const now = new Date();
      const activeSession = await this.attendanceSessionRepository
        .createQueryBuilder('current')
        .leftJoin('current.class', 'class')
        .where('class.id = :classId', { classId })
        .andWhere('current.id != :sessionId', { sessionId: session.id })
        .andWhere('current.isActive = true')
        .andWhere('current.closedAt IS NULL')
        .andWhere('current.expiresAt > :now', { now })
        .getOne();

      if (activeSession) {
        throw new BadRequestException(
          `Class "${classId}" already has an active attendance session`,
        );
      }

      session.class = classEntity;
    }

    if (expiresAt) {
      const resolvedExpiresAt = new Date(expiresAt);
      if (resolvedExpiresAt <= session.openedAt) {
        throw new BadRequestException('expiresAt must be after openedAt');
      }
      session.expiresAt = resolvedExpiresAt;
    } else if (durationMinutes) {
      session.expiresAt = new Date(
        session.openedAt.getTime() + durationMinutes * 60 * 1000,
      );
    }

    this.attendanceSessionRepository.merge(session, sessionDetails);

    try {
      await this.attendanceSessionRepository.save(session);

      return await this.attendanceSessionRepository.findOne({
        where: { id: session.id },
        relations: {
          class: true,
        },
      });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string | number) {
    const session = await this.findOne(id);

    try {
      await this.attendanceSessionRepository.remove(session);
      return {
        message: `Attendance session "${session.id}" removed successfully`,
      };
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
}
