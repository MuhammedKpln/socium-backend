import { Inject, NotFoundException, UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-errors';
import { PubSub } from 'graphql-subscriptions';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { PUB_SUB } from 'src/pubsub/pubsub.module';
import { Star } from 'src/star/entities/star.entity';
import { PROFILE_UPDATED_EVENT } from '../profile/events.pubsub';
import { UserService } from './user.service';

@ObjectType()
class CustomUserResponse extends User {
  @Field()
  postsCount: number;
  @Field()
  followersCount: number;
  @Field()
  followingsCount: number;
}

@Resolver((_of) => User)
export class UserResolver {
  constructor(
    private readonly usersService: UserService,
    @Inject(PUB_SUB) private pubSub: PubSub,
  ) {}

  @Subscription((_) => CustomUserResponse, {
    filter: (payload, variables) =>
      payload.profileUpdated.username === variables.username,
  })
  profileUpdated(@Args('username') username: string) {
    return this.pubSub.asyncIterator(PROFILE_UPDATED_EVENT);
  }

  @Query((_returns) => CustomUserResponse)
  async getUser(@Args('username') username: string) {
    const user = await this.usersService.getUserByUsername(username);

    if (user) {
      return user;
    }

    throw new NotFoundException();
  }

  @Query((_returns) => Star)
  @UseGuards(JwtAuthGuard)
  async getUserStars(@UserDecorator() user: User) {
    console.log(user.id);
    const stars = await this.usersService.getUserStars(user.id);

    if (stars) {
      return stars;
    }

    console.log('SEa');
  }

  @Mutation((_returns) => Star)
  @UseGuards(JwtAuthGuard)
  async addNewStar(@UserDecorator() user: User) {
    const stars = await this.usersService.addNewStar(1);

    if (stars) {
      this.pubSub.publish('userlendim', { userlendim: stars });

      return stars;
    }

    throw new ApolloError('Could not add star');
  }

  @Mutation((_returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteStar(@UserDecorator() user: User) {
    const stars = await this.usersService.deleteOneStar(user.id);

    if (stars) {
      return true;
    }

    return false;
  }
}
