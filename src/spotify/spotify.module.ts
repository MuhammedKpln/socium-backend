import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { SpotifyResolver } from './spotify.resolver';
import { SpotifyService } from './spotify.service';

@Module({
  imports: [PubsubModule, PrismaModule],
  providers: [SpotifyService, SpotifyResolver],
})
export class SpotifyModule {}
