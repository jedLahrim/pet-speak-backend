import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Reel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title?: string;

  @Column()
  reelUrl: string;
}
