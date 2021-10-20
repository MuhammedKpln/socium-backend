import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsNumber, MinLength } from 'class-validator';

@InputType()
export class ForgotPasswordDto {
  @IsNotEmpty()
  @MinLength(5)
  @Field()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  @Field()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  @Field()
  forgotPasswordCode: number;
}
