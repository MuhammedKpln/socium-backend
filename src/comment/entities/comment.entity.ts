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
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => PostEntity)
  post: PostEntity;

  @ManyToOne(() => User)
  parentUser: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
