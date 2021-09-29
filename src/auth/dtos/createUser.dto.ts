import { Field, InputType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import {
  IsNotEmpty,
  IsEmail,
  IsNumber,
  MinLength,
  MaxLength,
  IsString,
} from 'class-validator';

@InputType()
export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10)
  @Field()
  username: string;

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(15)
  @Field()
  password: string;

  @IsNotEmpty()
  @Field()
  password_confirmation: string;

  @IsNotEmpty()
  @IsEmail()
  @Field()
  email: string;
}
