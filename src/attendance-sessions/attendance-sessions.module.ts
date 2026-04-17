import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceSessionsService } from './attendance-sessions.service';
import { AttendanceSessionsController } from './attendance-sessions.controller';
import { AttendanceSession } from './entities/attendance-session.entity';
import { Class } from '../classes/entities/class.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceSession, Class]), AuthModule],
  controllers: [AttendanceSessionsController],
  providers: [AttendanceSessionsService],
})
export class AttendanceSessionsModule {}
