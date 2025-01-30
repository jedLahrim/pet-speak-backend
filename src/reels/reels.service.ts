import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { Reel } from './entity/reel.entity';
import { PaginationState } from './entity/pagination-state.entity';
import { Constant } from '../common/constant/constant';

@Injectable()
export class ReelsService {
  private readonly logger = new Logger(ReelsService.name);

  constructor(
    @InjectRepository(Reel) private readonly reelRepository: Repository<Reel>,
    @InjectRepository(PaginationState)
    private readonly paginationStateRepository: Repository<PaginationState>,
  ) {}

  /**
   * Fetches reels for a single username and saves them
   */
  async fetchAndSaveReelsForUsername(
    username: string,
    paginationToken: string = null,
  ): Promise<string | null> {
    const savedReels: Reel[] = [];
    try {
      const params: any = {
        username_or_id_or_url: username,
        url_embed_safe: 'true',
      };
      if (paginationToken) {
        params.pagination_token = paginationToken;
      }

      const response = await axios.get(Constant.API_URL, {
        params,
        headers: Constant.headers,
      });
      this.logger.log(`Count ${response?.data}`);
      if (response?.data?.data?.items) {
        for (const item of response.data.items) {
          const reel = this.reelRepository.create({
            title: item.caption?.text ?? '',
            reelUrl: item.video_url_original,
          });
          savedReels.push(reel);
        }
      }

      if (savedReels.length > 0) {
        await this.reelRepository.save(savedReels);
        this.logger.log(`Saved ${savedReels.length} reels for ${username}`);
      }

      // Return the new pagination token
      return response.data?.pagination_token || null;
    } catch (error) {
      this.logger.error(
        `Error fetching reels for ${username}: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Cron job to fetch and save reels daily at midnight
   */
  @Cron('0 0 * * *') // Runs at midnight every day
  async scheduledFetchReels(): Promise<void> {
    this.logger.log('Running scheduled job to fetch reels...');

    for (const username of Constant.usernames) {
      // Get the stored pagination token for this username
      const state = await this.paginationStateRepository.findOne({
        where: { username },
      });

      // Fetch reels using the stored pagination token
      const newPaginationToken = await this.fetchAndSaveReelsForUsername(
        username,
        state?.paginationToken,
      );

      // Store the new pagination token for next time
      await this.updatePaginationState(username, newPaginationToken);
    }

    this.logger.log('Finished fetching reels.');
  }

  async getRandomReels(): Promise<Reel[]> {
    return this.reelRepository
      .createQueryBuilder('reel')
      .orderBy('RAND()')
      .getMany();
  }

  /**
   * Updates the pagination state for a username
   */
  private async updatePaginationState(
    username: string,
    paginationToken: string | null,
  ): Promise<void> {
    let state = await this.paginationStateRepository.findOne({
      where: { username },
    });

    if (!state) {
      state = this.paginationStateRepository.create({ username });
    }

    state.paginationToken = paginationToken;

    await this.paginationStateRepository.save(state);
  }
}
