import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AttendanceSessionsService } from './attendance-sessions.service';
import { CreateAttendanceSessionDto } from './dto/create-attendance-session.dto';
import { UpdateAttendanceSessionDto } from './dto/update-attendance-session.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('attendance-sessions')
export class AttendanceSessionsController {
  constructor(
    private readonly attendanceSessionsService: AttendanceSessionsService,
  ) {}

  @Post()
  create(@Body() createAttendanceSessionDto: CreateAttendanceSessionDto) {
    return this.attendanceSessionsService.create(createAttendanceSessionDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.attendanceSessionsService.findAll(paginationDto);
  }

  @Get(':id/qr-token')
  getQrToken(@Param('id') id: string) {
    return this.attendanceSessionsService.getQrToken(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceSessionsService.findOne(id);
  }

  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.attendanceSessionsService.close(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttendanceSessionDto: UpdateAttendanceSessionDto,
  ) {
    return this.attendanceSessionsService.update(
      +id,
      updateAttendanceSessionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceSessionsService.remove(+id);
  }
}
