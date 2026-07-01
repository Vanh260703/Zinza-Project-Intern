import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Status } from '../enums';

export class CreateNovelDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  author: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status = Status.PENDING;

  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  categories: string[];
}
