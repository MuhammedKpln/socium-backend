import { Field, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { User as UserEntity } from 'src/auth/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { PostLike } from './PostLike.entity';

@ObjectType()
export class UserLike extends BaseStruct {
  user: UserEntity;

  @Field((_returns) => PostEntity, { nullable: true })
  post?: PostEntity;

  @IsOptional({ always: true })
  @Field((_returns) => Comment, { nullable: true })
  comment?: Comment;

  @Field((_returns) => PostLike, { nullable: true })
  postLike: PostLike;

  @Field()
  liked: boolean;
}
