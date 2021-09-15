import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostLike } from 'src/likes/entities/PostLike.entity';
import { UserLike } from 'src/likes/entities/UserLike.entity';
import { PostEntity } from './entities/post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostSubscriber } from './subscribers/post.subscriber';

@Module({
  controllers: [PostController],
  imports: [
    TypeOrmModule.forFeature([PostEntity, Comment, UserLike, PostLike]),
    AuthModule,
  ],
  providers: [PostService, AuthService, PostSubscriber],
  exports: [TypeOrmModule],
})
export class PostModule {}
