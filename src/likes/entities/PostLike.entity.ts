import { Field, ObjectType } from '@nestjs/graphql';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { UserLike } from './UserLike.entity';

@ObjectType()
export class PostLike extends BaseStruct {
  @Field()
  likeCount: number;

  @Field((_returns) => PostEntity)
  post: PostEntity;

  @Field((_returns) => Comment)
  commment: Comment;

  @Field((_returns) => UserLike, { nullable: true })
  userLike: UserLike;
}
