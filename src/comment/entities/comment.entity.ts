import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { PostLike } from 'src/likes/entities/PostLike.entity';
import { UserLike } from 'src/likes/entities/UserLike.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';

@ObjectType()
export class Comment extends BaseStruct {
  @Field()
  content: string;

  @Field((_returns) => User)
  user: User;

  @Field((_returns) => PostEntity)
  post: PostEntity;

  @Field((_returns) => User, { nullable: true })
  parentUser: User;

  @Field((_returns) => PostLike)
  postLike?: PostLike;

  @Field((_returns) => UserLike, { nullable: true })
  userLike?: UserLike;

  @Field((_returns) => [Comment], { nullable: true })
  parentComments: Comment[];
}
