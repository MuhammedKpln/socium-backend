import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { LoginResponse } from './loginUser.dto';

@InputType()
export class LoginUserGoogleDto {
  @IsNotEmpty()
  @IsEmail()
  @Field()
  email: string;

  @IsNotEmpty()
  @Field()
  idToken: string;
}

@ObjectType()
export class LoginUserGoogleResponse extends LoginResponse {}
