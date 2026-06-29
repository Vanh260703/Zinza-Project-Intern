import { IsUUID } from 'class-validator';

export class TrackDailyReadDto {
  @IsUUID()
  novelId: string;

  @IsUUID()
  chapterId: string;
}
