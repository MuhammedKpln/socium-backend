import { User } from './auth/entities/user.entity';
import { NotificationType } from './notification/entities/notification.type';

export const enum Queues {
  Notification = 'notification',
  SendNotification = 'sendNotification',
}

export interface ISendNotificationQueue {
  fromUser: User;
  toUser: number;
  notificationType: NotificationType;
  body?: string;
}
