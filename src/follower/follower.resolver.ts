import { InjectQueue } from '@nestjs/bull';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Queue } from 'bull';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { INotificationEntity } from 'src/notification/entities/notification.entity';
import { NotificationType } from 'src/notification/entities/notification.type';
import { INotificationJobData } from 'src/notification/providers/Notification.consumer';
import { Queues } from 'src/types';
import { Follower } from './entities/follower.entity';
import { FollowerService } from './follower.service';

@Resolver((_of) => Follower)
export class FollowerResolver {
  constructor(
    private readonly followersService: FollowerService,
    @InjectQueue(Queues.Notification)
    private readonly notification: Queue<INotificationJobData>,
  ) {}

  @Query((_returns) => Boolean)
  async userFollowsActor(
    @Args('userId') userId: number,
    @Args('actorId') actorId: number,
  ) {
    const model = await this.followersService.isUserFollowingActor(
      userId,
      actorId,
    );

    console.log(model);
    if (model) {
      return true;
    }

    return false;
  }

  @Query((_results) => [Follower])
  async getUserFollowers(
    @Args('userId') userId: number,
    @Args('pagination') pagination: PaginationParams,
  ) {
    return this.followersService.getFollowersById(userId, pagination);
  }

  @Query((_results) => [Follower])
  async getUserFollowings(
    @Args('userId') userId: number,
    @Args('pagination') pagination: PaginationParams,
  ) {
    return this.followersService.getFollowingsById(userId, pagination);
  }

  @Mutation((_results) => Boolean)
  @UseGuards(JwtAuthGuard)
  async followUser(
    @Args('actorId') actorId: number,
    @UserDecorator() user: User,
  ) {
    const followed = await this.followersService.followUser(user, actorId);

    if (followed) {
      this.notification.add(
        Queues.SendNotification,
        {
          fromUser: user,
          toUser: actorId,
          notificationType: NotificationType.Follow,
          entityId: followed.id,
          entityType: INotificationEntity.Follower,
        },
        {
          priority: 0.3,
          lifo: true,
        },
      );
      return true;
    }

    return false;
  }

  @Mutation((_results) => Boolean)
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @Args('actorId') actorId: number,
    @UserDecorator() user: User,
  ) {
    const unFollowed = await this.followersService.unFollowUser(user, actorId);

    if (unFollowed) {
      return true;
    }

    return false;
  }

  @Query((_) => [User])
  async shouldFollowThoseUsers(@UserDecorator() user: User) {
    return await this.followersService.shouldFollowThoseUsers(user);
  }
}
