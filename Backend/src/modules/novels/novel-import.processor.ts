import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as fs from 'fs';
import { NovelsService } from './novels.service';

export const NOVEL_IMPORT_QUEUE = 'novel-import';

export interface NovelImportJobData {
  userId: string;
  filePath: string;
}

@Processor(NOVEL_IMPORT_QUEUE)
export class NovelImportProcessor extends WorkerHost {
  private readonly logger = new Logger(NovelImportProcessor.name);

  constructor(private readonly novelsService: NovelsService) {
    super();
  }

  async process(job: Job<NovelImportJobData>) {
    const { userId, filePath } = job.data;
    this.logger.log(`Processing import job ${job.id} for user ${userId}`);

    try {
      const buffer = fs.readFileSync(filePath);
      const result = await this.novelsService.importFromZip(userId, buffer);
      this.logger.log(`Import job ${job.id} completed: novel "${result.slug}"`);
      return result;
    } finally {
      fs.unlink(filePath, (err) => {
        if (err) this.logger.warn(`Failed to delete temp file: ${filePath}`);
      });
    }
  }
}
