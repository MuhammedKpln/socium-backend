import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LoginResponse } from './loginUser.dto';

@InputType()
export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  @Field()
  username: string;

  @IsNotEmpty()
  @MinLength(5)
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

@InputType()
export class VerifyEmailDto {
  @IsNotEmpty()
  @IsEmail()
  @Field()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  @Field()
  verificationCode: number;
}

@ObjectType()
export class RegisterResponse extends LoginResponse {}
