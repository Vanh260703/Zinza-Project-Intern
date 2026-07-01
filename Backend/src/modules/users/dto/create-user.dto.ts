import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserGender } from '../enums';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @IsEnum(UserGender)
  gender: UserGender;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
