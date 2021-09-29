import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { STATUS_CODE } from 'src/status_code';
import { Follower } from './entities/follower.entity';
import { FollowerService } from './follower.service';

@Resolver((_of) => Follower)
export class FollowerResolver {
  constructor(private readonly followersService: FollowerService) {}

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
}
