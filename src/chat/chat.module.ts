import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MessageRequest } from './entities/messageRequest.entity';
import { Messages } from './entities/messages.entity';
import { Room } from './entities/room.entity';
import { Star } from '../star/entities/star.entity';
import { ChatResolver } from './chat.resolver';
import { MessagesResolver } from './messages.resolver';
import { BullModule } from '@nestjs/bull';
import { join } from 'path';
import { PubsubModule } from 'src/pubsub/pubsub.module';

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
