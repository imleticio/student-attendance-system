import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: 150,
  })
  name: string;

  @Column('varchar', {
    unique: true,
    length: 30,
  })
  code: string;

  @Column('text', {
    nullable: true,
  })
  description?: string | null;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @OneToMany(() => Course, (course) => course.subject)
  courses: Course[];

  @CreateDateColumn({
    type: 'timestamp without time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
  })
  updatedAt: Date;
}
