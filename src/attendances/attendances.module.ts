import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancesService } from './attendances.service';
import { AttendancesController } from './attendances.controller';
import { Attendance } from './entities/attendance.entity';
import { Class } from '../classes/entities/class.entity';
import { User } from '../auth/entities/user.entity';
import { AttendanceSession } from '../attendance-sessions/entities/attendance-session.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendance,
      Class,
      User,
      AttendanceSession,
      Enrollment,
    ]),
    AuthModule,
  ],
  controllers: [AttendancesController],
  providers: [AttendancesService],
})
export class AttendancesModule {}
