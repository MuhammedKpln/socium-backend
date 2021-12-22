import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { NotificationModule } from 'src/notification/notification.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { StarModule } from 'src/star/star.module';
import { ChatGateway } from './chat.gateway';
import { ChatResolver } from './chat.resolver';
import { ChatService } from './chat.service';
import { MessagesResolver } from './messages.resolver';

@Module({
  imports: [
    StarModule,
    PrismaModule,
    BullModule.registerQueue({
      name: 'deleteOutdatedMessages',
      processors: [join(__dirname, 'deleteOudatedMessages.queue.js')],
    }),
    PubsubModule,
    NotificationModule,
  ],
  providers: [ChatService, ChatGateway, ChatResolver, MessagesResolver],
})
export class ChatModule {}
