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
export class PostLike extends BaseStruct {
  @Column({ type: 'numeric', default: 0 })
  likeCount: number;

  @IsOptional()
  @OneToOne(() => PostEntity)
  @JoinColumn()
  post: PostEntity;

  @IsOptional()
  @OneToOne(() => Comment)
  @JoinColumn()
  commment: Comment;
}
