import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Gender, PetType } from '../enums/pet-type.enum';
import { Translation } from './translation.entity';

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

  @Column({ type: 'text', nullable: true })
  voiceUrl?: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
