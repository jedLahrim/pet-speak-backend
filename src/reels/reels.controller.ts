import { Controller, Get } from '@nestjs/common';
import { ReelsService } from './reels.service';
import { Reel } from './entity/reel.entity';

@Controller('reels')
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) {}

  @Get('fetch')
  async fetchReels(): Promise<void> {
    return this.reelsService.scheduledFetchReels();
  }

  @Get()
  async getRandomReels(): Promise<Promise<Reel[]>> {
    return this.reelsService.getRandomReels();
  }
}
