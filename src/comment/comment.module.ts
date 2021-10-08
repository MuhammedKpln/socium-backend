import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { PostLike } from 'src/likes/entities/PostLike.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { CommentSubscriber } from './entities/comment.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, PostEntity, PostLike]),
    AuthModule,
    PubsubModule,
  ],
  providers: [CommentService, AuthService, CommentResolver, CommentSubscriber],
  exports: [TypeOrmModule],
})
export class CommentModule {}
