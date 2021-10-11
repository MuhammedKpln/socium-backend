import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { PostLike } from './entities/PostLike.entity';
import { UserLike } from './entities/UserLike.entity';
import { UserLikeSubscriber } from './entities/userlike.subscriber';
import { LikesResolver } from './likes.resolver';
import { LikesService } from './likes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserLike, PostLike, PostEntity, Comment]),
    AuthModule,
  ],
  controllers: [],
  providers: [LikesService, UserLikeSubscriber, LikesResolver],
  exports: [TypeOrmModule, LikesService],
})
export class LikesModule {}
