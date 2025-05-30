import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Gender, PetType } from '../enums/pet-type.enum';
import { Translation } from './translation.entity';
import { User } from '../../user/entity/user.entity';
import { Exclude } from 'class-transformer';

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'simple-json' })
  petType: PetType;

  @Column({ type: 'simple-json' })
  gender: Gender;

  @Column({ type: 'text', nullable: true })
  profileImage?: string;

  @OneToMany(() => Translation, (translation) => translation.pet)
  translations: Translation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.pets, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @Column()
  userId: string;
}
