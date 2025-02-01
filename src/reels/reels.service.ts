import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import axios from 'axios';
import { Reel } from './entity/reel.entity';
import { PaginationState } from './entity/pagination-state.entity';
import { Constant } from '../common/constant/constant';
import * as cron from 'node-cron';

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
    if (response?.data?.data?.items) {
      this.logger.log(`Fetched data for ${username}: ${JSON.stringify(response.data)}`);
      for (const item of response?.data?.data?.items) {
        const reel = this.reelRepository.create({
          title: item.caption?.text ?? '',
          reelUrl: item.video_url_original,
          createdAt: new Date(), // Ensure createdAt is set
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
 * Delete reels that are older than 24 hours
 */
async deleteExpiredReels() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await this.reelRepository.delete({
      createdAt: LessThan(twentyFourHoursAgo),
    });
    
    this.logger.log(`Deleted ${result.affected} expired reels`);
  } catch (error) {
    this.logger.error(`Error deleting expired reels: ${error.message}`);
  }
}

/**
 * Cron job to fetch and save reels daily at midnight
 */
async scheduledFetchReels(): Promise<{ success: string }> {
  // Run every day at midnight UTC
  cron.schedule('20 13 * * *', async () => {
    this.logger.log('Running scheduled job to fetch reels...');
    
    // First, delete expired reels
    // await this.deleteExpiredReels();
    
    // Then fetch new reels
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
  }, {timezone: 'UTC'});

  // Add another cron job to clean up expired reels every hour
  cron.schedule('0 * * * *', async () => {
    this.logger.log('Running hourly cleanup of expired reels...');
    await this.deleteExpiredReels();
  }, {timezone: 'UTC'});

  return { success: 'Reels fetching and cleanup scheduled successfully' };
}

async getRandomReels(take: number, skip: number): Promise<Reel[]> {
    const query =  this.reelRepository
      .createQueryBuilder('reel')
      .orderBy('RAND()')
      if(skip){
        query.skip(skip)
      }
        if(take){
        query.take(take)
      }
    return  query.getMany();
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
