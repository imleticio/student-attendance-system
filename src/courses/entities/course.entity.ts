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
import { Subject } from '../../subjects/entities/subject.entity';
import { User } from '../../auth/entities/user.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Class } from '../../classes/entities/class.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: 150,
  })
  name: string;

  @Column('int')
  year: number;

  @Column('smallint')
  semester: number;

  @Column('text', {
    nullable: true,
  })
  schedule?: string | null;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @ManyToOne(() => Subject, (subject) => subject.courses, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => User, (user) => user.teachingCourses, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  @OneToMany(() => Class, (classEntity) => classEntity.course)
  classes: Class[];

  @CreateDateColumn({
    type: 'timestamp without time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
  })
  updatedAt: Date;
}
