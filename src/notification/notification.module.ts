import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { Queues } from 'src/types';
import { NotificationResolver } from './notification.resolver';
import { NotificationService } from './notification.service';
import { NotificationConsumer } from './providers/Notification.consumer';

@Module({
  imports: [
    PubsubModule,
    BullModule.registerQueueAsync({
      name: Queues.Notification,
      useFactory: () => {
        return {
          defaultJobOptions: {
            attempts: 1,
          },
        };
      },
    }),
  ],
  providers: [NotificationService, NotificationResolver, NotificationConsumer],
  exports: [NotificationService, BullModule],
})
export class NotificationModule {}
