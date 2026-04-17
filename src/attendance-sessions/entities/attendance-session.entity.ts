import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { Attendance } from '../../attendances/entities/attendance.entity';

@Entity('attendance_sessions')
export class AttendanceSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Class, (classEntity) => classEntity.attendanceSessions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column('varchar', {
    unique: true,
    length: 120,
  })
  token: string;

  @Column('text', {
    nullable: true,
  })
  qrValue?: string | null;

  @Column('double precision')
  geoLat: number;

  @Column('double precision')
  geoLng: number;

  @Column('int', {
    default: 120,
  })
  geoRadiusMeters: number;

  @Column('int', {
    default: 10,
  })
  qrRotationSeconds: number;

  @Column({
    type: 'timestamp without time zone',
  })
  openedAt: Date;

  @Column({
    type: 'timestamp without time zone',
  })
  expiresAt: Date;

  @Column({
    type: 'timestamp without time zone',
    nullable: true,
  })
  closedAt?: Date | null;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @OneToMany(() => Attendance, (attendance) => attendance.attendanceSession)
  attendances: Attendance[];

  @CreateDateColumn({
    type: 'timestamp without time zone',
  })
  createdAt: Date;
}
