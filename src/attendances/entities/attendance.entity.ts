import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { User } from '../../auth/entities/user.entity';
import { AttendanceSession } from '../../attendance-sessions/entities/attendance-session.entity';
import { AttendanceStatus } from '../enums/attendance-status.enum';
import { AttendanceMethod } from '../enums/attendance-method.enum';

@Entity('attendances')
@Unique('UQ_attendances_student_class', ['student', 'class'])
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Class, (classEntity) => classEntity.attendances, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @ManyToOne(() => User, (user) => user.attendances, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(
    () => AttendanceSession,
    (attendanceSession) => attendanceSession.attendances,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'attendance_session_id' })
  attendanceSession?: AttendanceSession | null;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Column({
    type: 'enum',
    enum: AttendanceMethod,
    default: AttendanceMethod.MANUAL,
  })
  method: AttendanceMethod;

  @Column({
    type: 'timestamp without time zone',
  })
  markedAt: Date;

  @Column('text', {
    nullable: true,
  })
  validationNotes?: string | null;

  @CreateDateColumn({
    type: 'timestamp without time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
  })
  updatedAt: Date;
}
