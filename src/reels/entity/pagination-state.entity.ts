import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaginationState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  paginationToken: string;

  @Column({ nullable: true })
  lastUpdated: Date;
}
