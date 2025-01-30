import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReelsService } from './reels.service';
import { ReelsController } from './reels.controller';
import { Reel } from './entity/reel.entity';
import { PaginationState } from './entity/pagination-state.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reel, PaginationState])],
  providers: [ReelsService],
  controllers: [ReelsController],
})
export class ReelsModule {}
