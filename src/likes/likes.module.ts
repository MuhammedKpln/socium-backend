import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PostLike } from './entities/PostLike.entity';
import { UserLikeSubscriber } from './entities/postlike.subscriber';
import { UserLike } from './entities/UserLike.entity';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserLike, PostLike]), AuthModule],
  controllers: [LikesController],
  providers: [LikesService, UserLikeSubscriber],
  exports: [TypeOrmModule, LikesService],
})
export class LikesModule {}
