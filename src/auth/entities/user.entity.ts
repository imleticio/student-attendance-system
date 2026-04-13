import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ValidRoles } from '../interfaces';
import { Course } from '../../courses/entities/course.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Class } from '../../classes/entities/class.entity';
import { Attendance } from '../../attendances/entities/attendance.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  fullName: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text', {
    select: false,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: ValidRoles,
    default: ValidRoles.STUDENT,
  })
  
  role: ValidRoles;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @OneToMany(() => Course, (course) => course.teacher)
  teachingCourses: Course[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments: Enrollment[];

  @OneToMany(() => Class, (classEntity) => classEntity.createdBy)
  createdClasses: Class[];

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];

  @CreateDateColumn({
    type: 'timestamp without time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
  })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    this.email = this.email.toLowerCase().trim();
  }
}
