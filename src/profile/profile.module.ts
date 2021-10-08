import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { ProfileController } from './profile.controller';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  controllers: [ProfileController],
  imports: [AuthModule, PubsubModule],
  providers: [ProfileService, AuthService, ProfileResolver],
})
export class ProfileModule {}
