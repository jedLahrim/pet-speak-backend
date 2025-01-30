import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaginationState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  paginationToken: string;

  @Column()
  lastUpdated: Date;
}
