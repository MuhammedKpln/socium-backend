import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { PostsResolver } from './post.resolver';
import { PostService } from './post.service';

@Module({
  imports: [AuthModule, PubsubModule, PrismaModule],
  providers: [PostService, PostsResolver],
})
export class PostModule {}
