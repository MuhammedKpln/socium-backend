import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { PostLike } from 'src/likes/entities/PostLike.entity';
import { UserLike } from 'src/likes/entities/UserLike.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity()
@ObjectType()
export class Comment extends BaseStruct {
  @Column()
  @Field()
  content: string;

  @ManyToOne(() => User, { eager: true })
  @Field((_returns) => User)
  user: User;

  @ManyToOne(() => PostEntity)
  @Field((_returns) => PostEntity)
  post: PostEntity;

  @ManyToOne(() => User, { eager: true })
  @Field((_returns) => User)
  parentUser: User;

  @OneToOne(() => PostLike, (like) => like.commment, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  @Field((_returns) => PostLike)
  postLike?: PostLike;

  @OneToOne(() => UserLike, (like) => like.comment, { eager: true })
  @Field((_returns) => UserLike, { nullable: true })
  userLike?: UserLike;
}
