import { IsOptional } from 'class-validator';
import { User as UserEntity } from 'src/auth/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { StaticEntityFields } from 'src/typeorm/StaticEntityFields';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { PostLike } from './PostLike.entity';

@Entity()
export class UserLike extends StaticEntityFields {
  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;

  @IsOptional({ always: true })
  @OneToOne(() => PostEntity, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  post?: PostEntity;

  @IsOptional({ always: true })
  @OneToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  comment?: Comment;

  @OneToOne(() => PostLike, (postlike) => postlike.post, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  postLike: PostLike;

  @Column({ type: 'boolean' })
  liked: boolean;
}
