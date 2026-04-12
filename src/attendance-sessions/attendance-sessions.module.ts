import { Module } from '@nestjs/common';
import { AttendanceSessionsService } from './attendance-sessions.service';
import { AttendanceSessionsController } from './attendance-sessions.controller';

@Module({
  controllers: [AttendanceSessionsController],
  providers: [AttendanceSessionsService],
})
export class AttendanceSessionsModule {}
