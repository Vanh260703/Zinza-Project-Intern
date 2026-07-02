import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;
}
