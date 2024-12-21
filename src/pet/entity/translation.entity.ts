import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pet } from './pet.entity';

@Entity()
export class Translation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  text: string;

  @Column({ type: 'varchar', nullable: true })
  label?: string;

  @ManyToOne(() => Pet, (pet) => pet.translations, { onDelete: 'CASCADE' })
  pet: Pet;
}
