import { Field, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { User as UserEntity } from 'src/auth/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { PostLike } from './PostLike.entity';

@Entity()
@ObjectType()
export class UserLike extends BaseStruct {
  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;

  @OneToOne(() => PostEntity, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @Field((_returns) => PostEntity, { nullable: true })
  post?: PostEntity;

  @IsOptional({ always: true })
  @OneToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  @Field((_returns) => Comment, { nullable: true })
  comment?: Comment;

  @OneToOne(() => PostLike, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  @Field((_returns) => PostLike, { nullable: true })
  postLike: PostLike;

  @Column({ type: 'boolean' })
  @Field()
  liked: boolean;
}
