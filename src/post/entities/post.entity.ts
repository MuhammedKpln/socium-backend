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

export enum PostType {
  Content = 0,
  Instagram = 1,
  Twitter = 2,
  Youtube = 3,
}

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;

  @Column() // TODO: number for postgres
  type: PostType;

  @Column({ nullable: true }) // TODO: number for postgres
  slug?: string;

  @Column()
  color: string;

  @CreateDateColumn()
  created_at?: Date;

  @OneToMany(() => Comment, (comment) => comment.post)
  @JoinColumn({
    referencedColumnName: 'post',
  })
  comments?: Comment[];

  @OneToOne(() => UserLike, (like) => like.post)
  userLike?: UserLike;

  @OneToOne(() => PostLike, (like) => like.post)
  postLike?: PostLike;

  @UpdateDateColumn()
  updated_at?: Date;

  @BeforeInsert()
  slugify?() {
    var slugify = require('slugify');

    this.slug = slugify(getRandomString(100));
  }
}
