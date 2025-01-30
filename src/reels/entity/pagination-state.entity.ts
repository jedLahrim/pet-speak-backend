import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaginationState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ nullable: true })
  paginationToken: string;

  @Column()
  lastUpdated: Date;
}
