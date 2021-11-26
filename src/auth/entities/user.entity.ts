import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';

export enum Gender {
  Male = 0,
  Female = 1,
  Other = 2,
}

@ObjectType()
class IUserCountMap {
  @Field()
  posts: number;

  @Field()
  followers: number;

  @Field()
  followings: number;
}

@ObjectType()
export class User {
  @Field()
  id: number;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatar: string;

  @Field({ nullable: true, defaultValue: false })
  blockIncomingCalls: boolean;

  @Field({ nullable: true })
  gender: Gender;

  @Field({ nullable: true })
  bio: string;

  @Exclude({ toPlainOnly: true })
  password: string;

  @Field()
  public isEmailConfirmed: boolean;

  @Exclude({ toPlainOnly: true })
  public emailConfirmationCode: number;

  @Exclude({ toPlainOnly: true })
  forgotPasswordCode: number;

  @Field()
  created_at: Date;

  @Field({ nullable: true })
  birthday: Date;

  //TODO: onupdate change date auto
  @Field()
  updated_at: Date;

  @Field()
  _count: IUserCountMap;
}
