import { Field, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { User } from 'src/auth/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { getRandomString } from 'src/helpers/randomString';
import { PostLike } from 'src/likes/entities/PostLike.entity';
import { UserLike } from 'src/likes/entities/UserLike.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import slugify from 'slugify';

export enum PostType {
  Content = 0,
  Instagram = 1,
  Twitter = 2,
  Youtube = 3,
}

@Entity('posts')
@ObjectType()
export class PostEntity {
  @PrimaryGeneratedColumn()
  @Field()
  id?: number;

  @Column()
  @Field()
  content: string;

  @Field((returns) => User)
  @ManyToOne(() => User, (user) => user.id, { eager: true })
  @JoinColumn()
  user: User;

  @Column() // TODO: number for postgres
  @Field()
  type: PostType;

  @Column({ nullable: true }) // TODO: number for postgres
  @Field()
  slug?: string;

  @Column()
  @Field()
  color: string;

  @CreateDateColumn()
  @Field()
  created_at?: Date;

  @OneToMany(() => Comment, (comment) => comment.post, { eager: true })
  @JoinColumn({
    referencedColumnName: 'post',
  })
  @Field((returns) => [Comment])
  comments?: Comment[];

  @OneToOne(() => UserLike, (like) => like.post, { eager: true })
  @Field((returns) => UserLike, { nullable: true })
  userLike?: UserLike;

  @OneToOne(() => PostLike, (like) => like.post, { cascade: true, eager: true })
  @JoinColumn()
  @Field((returns) => PostLike)
  postLike?: PostLike;

  @UpdateDateColumn()
  @Field()
  updated_at?: Date;

  @Field()
  commentsCount?: number;

  @BeforeInsert()
  slugify?() {
    this.slug = slugify(getRandomString(100));
  }
}
