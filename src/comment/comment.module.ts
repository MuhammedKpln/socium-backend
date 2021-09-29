import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { PostEntity } from 'src/post/entities/post.entity';
import { CommentController } from './comment.controller';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, PostEntity]), AuthModule],
  controllers: [CommentController],
  providers: [CommentService, AuthService, CommentResolver],
  exports: [TypeOrmModule],
})
export class CommentModule {}
