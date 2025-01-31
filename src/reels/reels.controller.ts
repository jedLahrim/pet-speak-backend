import { Controller, Get, Post, Query } from '@nestjs/common';
import { ReelsService } from './reels.service';
import { Reel } from './entity/reel.entity';

@Controller('reels')
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) {}

  @Post('fetch')
  async fetchReels(): Promise<{ success: string }> {
    return this.reelsService.scheduledFetchReels();
  }

  @Get()
  async getRandomReels(
    @Query('take') take: number,
    @Query('skip') skip: number
  ): Promise<Reel[]> {
    return this.reelsService.getRandomReels(take, skip);
  }
}
