import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserGender } from '../enums';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @IsOptional()
  @IsEnum(UserGender)
  gender: UserGender;
}
