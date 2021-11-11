import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostLike } from 'src/likes/entities/PostLike.entity';
import { UserLike } from 'src/likes/entities/UserLike.entity';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { PostEntity } from './entities/post.entity';
import { PostsResolver } from './post.resolver';
import { PostService } from './post.service';
import { PostSubscriber } from './subscribers/post.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, Comment, UserLike, PostLike]),
    AuthModule,
    PubsubModule,
  ],
  providers: [PostService, AuthService, PostSubscriber, PostsResolver],
  exports: [TypeOrmModule],
})
export class PostModule {}
