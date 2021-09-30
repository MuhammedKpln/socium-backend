import { Field, ObjectType } from '@nestjs/graphql';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity()
@ObjectType()
export class PostLike extends BaseStruct {
  @Column({ type: 'smallint', default: 0 })
  @Field()
  likeCount: number;

  @OneToOne(() => PostEntity, (post) => post.postLike)
  @Field((_returns) => PostEntity)
  post: PostEntity;

  @OneToOne(() => Comment, (comment) => comment.postLike)
  @Field((_returns) => Comment)
  commment: Comment;
}
