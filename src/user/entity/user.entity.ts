import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsOptional, IsString } from 'class-validator';

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

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
