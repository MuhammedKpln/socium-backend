import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { Star } from '../star/entities/star.entity';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatResolver } from './chat.resolver';
import { ChatService } from './chat.service';
import { MessageRequest } from './entities/messageRequest.entity';
import { Messages } from './entities/messages.entity';
import { Room } from './entities/room.entity';
import { MessagesResolver } from './messages.resolver';

@Module({
  controllers: [ChatController],
  imports: [
    TypeOrmModule.forFeature([Messages, Room, Star, MessageRequest]),
    BullModule.registerQueue({
      name: 'deleteOutdatedMessages',
      processors: [join(__dirname, 'deleteOudatedMessages.queue.js')],
    }),
    PubsubModule,
  ],
  providers: [ChatService, ChatGateway, ChatResolver, MessagesResolver],
  exports: [TypeOrmModule],
})
export class ChatModule {}
