import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { User } from '../entities/user.entity';

@InputType()
export class LoginUserDto {
  @IsNotEmpty()
  @Field()
  email: string;

  @IsNotEmpty()
  @Field()
  password: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;
  @Field()
  refresh_token: string;
  @Field()
  user: User;
  @Field()
  expire_date: Date;
}
