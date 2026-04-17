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
import { AttendancesService } from './attendances.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { ScanAttendanceDto } from './dto/scan-attendance.dto';
import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { User } from '../auth/entities';

@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Post('scan')
  @Auth(ValidRoles.STUDENT)
  scanWithQr(
    @Body() scanAttendanceDto: ScanAttendanceDto,
    @GetUser() student: User,
  ) {
    return this.attendancesService.scanWithQr(scanAttendanceDto, student);
  }

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendancesService.create(createAttendanceDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.attendancesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendancesService.findOne(id);
  }
}
