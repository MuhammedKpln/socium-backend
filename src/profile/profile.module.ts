import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { Queues } from 'src/types';
import { MinifyAvatarConsumer } from './consumers/MinifyAvatar.consumer';
import { ProfileController } from './profile.controller';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  controllers: [ProfileController],
  imports: [
    AuthModule,
    BullModule.registerQueue({
      name: Queues.MinifyAvatar,
    }),
  ],
  providers: [
    ProfileService,
    AuthService,
    ProfileResolver,
    MinifyAvatarConsumer,
  ],
})
export class ProfileModule {}
