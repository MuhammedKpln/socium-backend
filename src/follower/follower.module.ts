import { Module } from '@nestjs/common';
import { NotificationModule } from 'src/notification/notification.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FollowerResolver } from './follower.resolver';
import { FollowerService } from './follower.service';

@Module({
  providers: [FollowerService, FollowerResolver],
  imports: [NotificationModule, PrismaModule],
})
export class FollowerModule {}
