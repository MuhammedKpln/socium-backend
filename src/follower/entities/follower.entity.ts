import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';

@ObjectType()
export class Follower extends BaseStruct {
  @Field((_returns) => User)
  user: User;

  @Field((_returns) => User)
  actor: User;

  @Field({ nullable: true })
  userId: number;

  @Field({ nullable: true })
  actorId: number;

  @Field({ nullable: true })
  isFollowing: boolean;
}
