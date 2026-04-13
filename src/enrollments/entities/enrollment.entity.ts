import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';

@Entity('enrollments')
@Unique('UQ_enrollments_student_course', ['student', 'course'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.enrollments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => Course, (course) => course.enrollments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @CreateDateColumn({
    type: 'timestamp without time zone',
  })
  createdAt: Date;
}
