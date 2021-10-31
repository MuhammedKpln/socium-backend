import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { UpdateCurrentTrackDto } from './dtos/UpdateCurrentTrack.dto';
import { SpotifyCurrentlyListening } from './entities/SpotifyListening.entity';
import { SpotifyService } from './spotify.service';
import { User } from 'src/auth/entities/user.entity';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { PUB_SUB } from 'src/pubsub/pubsub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { SpotifyPubSubEvents } from './pubSub.events';

@Resolver((_of) => SpotifyCurrentlyListening)
export class SpotifyResolver {
  constructor(
    private readonly spotifyService: SpotifyService,
    @Inject(PUB_SUB) private readonly pubSub: RedisPubSub,
  ) {}

  @Subscription((_returns) => SpotifyCurrentlyListening, {
    filter: (payload, variables) =>
      payload.syncWithUserListeningTrack.user.id === variables.userId,
  })
  async syncWithUserListeningTrack(@Args('userId') userId: number) {
    return this.pubSub.asyncIterator(SpotifyPubSubEvents.ChangedSong);
  }

  @UseGuards(JwtAuthGuard)
  @Query((_returns) => SpotifyCurrentlyListening, { nullable: true })
  async getUserCurrentTrack(@Args('userId') userId: number) {
    const track = await this.spotifyService.getUserCurrentTrack(userId);

    if (track) {
      return track;
    }

    return null;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((_returns) => Boolean)
  async updateCurrentTrack(
    @Args('data') spotify: UpdateCurrentTrackDto,
    @UserDecorator() user: User,
  ) {
    const updated = await this.spotifyService.updateUserCurrentTrack(
      user.id,
      spotify,
    );

    if (updated) {
      await this.pubSub.publish(SpotifyPubSubEvents.ChangedSong, {
        syncWithUserListeningTrack: updated,
      });

      return true;
    }

    return false;
  }
}
