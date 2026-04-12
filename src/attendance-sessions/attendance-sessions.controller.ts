import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AttendanceSessionsService } from './attendance-sessions.service';
import { CreateAttendanceSessionDto } from './dto/create-attendance-session.dto';
import { UpdateAttendanceSessionDto } from './dto/update-attendance-session.dto';

@Controller('attendance-sessions')
export class AttendanceSessionsController {
  constructor(private readonly attendanceSessionsService: AttendanceSessionsService) {}

  @Post()
  create(@Body() createAttendanceSessionDto: CreateAttendanceSessionDto) {
    return this.attendanceSessionsService.create(createAttendanceSessionDto);
  }

  @Get()
  findAll() {
    return this.attendanceSessionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceSessionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttendanceSessionDto: UpdateAttendanceSessionDto) {
    return this.attendanceSessionsService.update(+id, updateAttendanceSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceSessionsService.remove(+id);
  }
}
