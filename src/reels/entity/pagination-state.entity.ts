import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaginationState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  paginationToken: string;

  @Column({ nullable: true })
  lastUpdated: Date;
}
