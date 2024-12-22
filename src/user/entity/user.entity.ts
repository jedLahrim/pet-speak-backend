import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Pet } from '../../pet/entity/pet.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Column({ unique: true, nullable: true })
  @IsOptional()
  @IsString()
  username?: string;

  access?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Pet, (pet) => pet.user)
  pets: Pet[];

}
