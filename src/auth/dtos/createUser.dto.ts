import { Exclude } from 'class-transformer';
import {
  IsNotEmpty,
  IsEmail,
  IsNumber,
  MinLength,
  MaxLength,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10)
  username: string;

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(15)
  password: string;

  @IsNotEmpty()
  password_confirmation: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  gender: 1 | 2 | 3;
}
