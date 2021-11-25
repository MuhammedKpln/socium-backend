import { Module } from '@nestjs/common';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [PubsubModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
