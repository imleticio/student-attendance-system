import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { User } from '../../auth/entities/user.entity';
import { ClassStatus } from '../enums/class-status.enum';
import { AttendanceSession } from '../../attendance-sessions/entities/attendance-session.entity';
import { Attendance } from '../../attendances/entities/attendance.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Course, (course) => course.classes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column('varchar', {
    length: 150,
    nullable: true,
  })
  title?: string | null;

  @Column('text', {
    nullable: true,
  })
  topic?: string | null;

  @Column('date')
  classDate: string;

  @Column('time')
  startTime: string;

  @Column('time')
  endTime: string;

  @Column({
    type: 'enum',
    enum: ClassStatus,
    default: ClassStatus.SCHEDULED,
  })
  status: ClassStatus;

  @ManyToOne(() => User, (user) => user.createdClasses, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => AttendanceSession, (attendanceSession) => attendanceSession.class)
  attendanceSessions: AttendanceSession[];

  @OneToMany(() => Attendance, (attendance) => attendance.class)
  attendances: Attendance[];

  @CreateDateColumn({
    type: 'timestamp without time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
  })
  updatedAt: Date;
}
