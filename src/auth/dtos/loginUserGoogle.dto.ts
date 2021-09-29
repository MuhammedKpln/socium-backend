import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { User } from '../entities/user.entity';

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
export class LoginUserGoogleResponse {
  @Field()
  access_token: string;
  @Field()
  user: User;
}
