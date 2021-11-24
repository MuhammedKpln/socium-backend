import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserLikeSubscriber } from './entities/userlike.subscriber';
import { LikesResolver } from './likes.resolver';
import { LikesService } from './likes.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [LikesService, UserLikeSubscriber, LikesResolver],
  exports: [LikesService],
})
export class LikesModule {}
