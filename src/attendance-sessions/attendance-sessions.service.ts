import { Injectable } from '@nestjs/common';
import { CreateAttendanceSessionDto } from './dto/create-attendance-session.dto';
import { UpdateAttendanceSessionDto } from './dto/update-attendance-session.dto';

@Injectable()
export class AttendanceSessionsService {
  create(createAttendanceSessionDto: CreateAttendanceSessionDto) {
    return 'This action adds a new attendanceSession';
  }

  findAll() {
    return `This action returns all attendanceSessions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} attendanceSession`;
  }

  update(id: number, updateAttendanceSessionDto: UpdateAttendanceSessionDto) {
    return `This action updates a #${id} attendanceSession`;
  }

  remove(id: number) {
    return `This action removes a #${id} attendanceSession`;
  }
}
