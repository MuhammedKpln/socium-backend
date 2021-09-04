import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { PostEntity } from './entities/post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  controllers: [PostController],
  imports: [TypeOrmModule.forFeature([PostEntity]), AuthModule],
  providers: [PostService, AuthService],
  exports: [TypeOrmModule],
})
export class PostModule {}
