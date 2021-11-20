import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { FcmNotificationUser } from 'src/notification/entities/fcmNotifications.entity';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { Star } from '../star/entities/star.entity';
import { ChatGateway } from './chat.gateway';
import { ChatResolver } from './chat.resolver';
import { ChatService } from './chat.service';
import { Block } from './entities/block-list.entity';
import { MessageRequest } from './entities/messageRequest.entity';
import { Messages } from './entities/messages.entity';
import { Room } from './entities/room.entity';
import { MessagesResolver } from './messages.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Messages,
      Room,
      Star,
      MessageRequest,
      Block,
      FcmNotificationUser,
    ]),
    BullModule.registerQueue({
      name: 'deleteOutdatedMessages',
      processors: [join(__dirname, 'deleteOudatedMessages.queue.js')],
    }),
    PubsubModule,
    AuthModule,
  ],
  providers: [
    ChatService,
    ChatGateway,
    ChatResolver,
    MessagesResolver,
    AuthService,
  ],
  exports: [TypeOrmModule],
})
export class ChatModule {}
