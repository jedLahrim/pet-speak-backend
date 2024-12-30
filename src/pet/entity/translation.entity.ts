import { Column, Entity, ManyToOne, PrimaryGeneratedColumn,  
  CreateDateColumn,
  UpdateDateColumn
       } from 'typeorm';
import { Pet } from './pet.entity';

@Entity()
export class Translation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  text: string;

  @Column({ type: 'varchar', nullable: true })
  label?: string;

  @Column({ type: 'text', nullable: true })
  voiceUrl?: string;

  @ManyToOne(() => Pet, (pet) => pet.translations, { onDelete: 'CASCADE' })
  pet: Pet;

  @Column()
  petId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
