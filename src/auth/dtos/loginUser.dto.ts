import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { User } from '../entities/user.entity';

@InputType()
export class LoginUserDto {
  @IsNotEmpty()
  @Field()
  username: string;

  @IsNotEmpty()
  @Field()
  password: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;
  @Field()
  user: User;
}
