import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Subject } from '../../subjects/entities/subject.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('institutions')
export class Institution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    unique: true,
    length: 150,
  })
  name: string;

  @Column('varchar', {
    unique: true,
    length: 30,
  })
  code: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @OneToMany(() => Subject, (subject) => subject.institution)
  subjects: Subject[];

  @OneToMany(() => User, (user) => user.institution)
  users: User[];

  @CreateDateColumn({
    type: 'timestamp without time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
  })
  updatedAt: Date;
}
