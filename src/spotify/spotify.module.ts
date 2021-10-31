import { Module } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpotifyCurrentlyListening } from './entities/SpotifyListening.entity';
import { SpotifyResolver } from './spotify.resolver';
import { PubsubModule } from 'src/pubsub/pubsub.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpotifyCurrentlyListening]),
    PubsubModule,
  ],
  providers: [SpotifyService, SpotifyResolver],
})
export class SpotifyModule {}
