import { Field, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import {
  AfterInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity()
@ObjectType()
export class PostLike extends BaseStruct {
  @Column({ type: 'numeric', default: 0 })
  @Field()
  likeCount: number;

  @IsOptional()
  @OneToOne(() => PostEntity, (post) => post.id)
  @Field((returns) => PostEntity)
  post: PostEntity;

  @IsOptional()
  @OneToOne(() => Comment)
  @JoinColumn()
  @Field((returns) => Comment)
  commment: Comment;
}
