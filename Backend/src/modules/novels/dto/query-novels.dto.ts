import {
  IsBooleanString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder, Status } from '../enums';

export class QueryNovelsDto {
  @IsOptional()
  @IsString()
  q?: string; // search query

  @IsOptional()
  @IsString()
  category?: string; // category slug

  @IsOptional()
  @IsString()
  ids?: string; // danh sách id, ngăn cách bởi dấu phẩy

  @IsOptional()
  @IsUUID()
  postedBy?: string; // lọc theo người đăng (id) — dùng cho /mine & public profile

  @IsOptional()
  @IsBooleanString()
  vip?: string; // 'true' | 'false'

  @IsOptional()
  @IsEnum(SortOrder)
  sort?: SortOrder;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
