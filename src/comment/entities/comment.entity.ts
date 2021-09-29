import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Comment {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column()
  @Field()
  content: string;

  @ManyToOne(() => User, { eager: true })
  @Field((returns) => User)
  user: User;

  @ManyToOne(() => PostEntity)
  @Field((returns) => PostEntity)
  post: PostEntity;

  @ManyToOne(() => User, { eager: true })
  @Field((returns) => User)
  parentUser: User;

  @CreateDateColumn()
  @Field()
  created_at: Date;

  @UpdateDateColumn()
  @Field()
  updated_at: Date;
}
