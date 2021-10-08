import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { FcmNotificationUser } from './entities/fcmNotifications.entity';
import { Notification } from './entities/notification.entity';
import { NotificationResolver } from './notification.resolver';
import { NotificationService } from './notification.service';
import { NotificationConsumer } from './providers/Notification.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, FcmNotificationUser]),
    PubsubModule,
    BullModule.registerQueueAsync({
      name: 'sendNotification',
    }),
  ],
  providers: [NotificationService, NotificationResolver, NotificationConsumer],
  exports: [TypeOrmModule, NotificationService, BullModule],
})
export class NotificationModule {}
