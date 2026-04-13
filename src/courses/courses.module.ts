import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Subject, User])],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
