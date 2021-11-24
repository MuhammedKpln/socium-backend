import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { Follower } from './entities/follower.entity';
import { FollowerController } from './follower.controller';
import { FollowerResolver } from './follower.resolver';
import { FollowerService } from './follower.service';

@Module({
  providers: [FollowerService, FollowerResolver],
  imports: [TypeOrmModule.forFeature([Follower, User]), NotificationModule],
  controllers: [FollowerController],
  exports: [TypeOrmModule],
})
export class FollowerModule {}
