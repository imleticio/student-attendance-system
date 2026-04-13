import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Institution } from '../../institutions/entities/institution.entity';

@Entity('subjects')
@Unique(['code', 'institution'])
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: 150,
  })
  name: string;

  @Column('varchar', {
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

  @ManyToOne(() => Institution, (institution) => institution.subjects, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

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
