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
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@Controller('attendance-sessions')
export class AttendanceSessionsController {
  constructor(
    private readonly attendanceSessionsService: AttendanceSessionsService,
  ) {}

  @Post()
  @Auth(ValidRoles.TEACHER, ValidRoles.ADMIN)
  create(@Body() createAttendanceSessionDto: CreateAttendanceSessionDto) {
    return this.attendanceSessionsService.create(createAttendanceSessionDto);
  }

  @Get()
  @Auth(ValidRoles.TEACHER, ValidRoles.ADMIN)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.attendanceSessionsService.findAll(paginationDto);
  }

  @Get(':id/qr-token')
  @Auth(ValidRoles.TEACHER, ValidRoles.ADMIN)
  getQrToken(@Param('id') id: string) {
    return this.attendanceSessionsService.getQrToken(id);
  }

  @Get(':id')
  @Auth(ValidRoles.TEACHER, ValidRoles.ADMIN)
  findOne(@Param('id') id: string) {
    return this.attendanceSessionsService.findOne(id);
  }

  @Patch(':id/close')
  @Auth(ValidRoles.TEACHER, ValidRoles.ADMIN)
  close(@Param('id') id: string) {
    return this.attendanceSessionsService.close(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.TEACHER, ValidRoles.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateAttendanceSessionDto: UpdateAttendanceSessionDto,
  ) {
    return this.attendanceSessionsService.update(
      id,
      updateAttendanceSessionDto,
    );
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMIN)
  remove(@Param('id') id: string) {
    return this.attendanceSessionsService.remove(id);
  }
}
