import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  OnQueueStalled,
  Process,
  Processor,
} from '@nestjs/bull';
import { DoneCallback, Job } from 'bull';
import * as firebase from 'firebase-admin';
import { User } from 'src/auth/entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { Queues } from 'src/types';
import {
  INotificationEntity,
  INotificationEntityTypes,
} from '../entities/notification.entity';
import {
  NotificationTitle,
  NotificationType,
} from '../entities/notification.type';

export interface INotificationJobData {
  fromUser: User;
  toUser: number;
  notificationType: NotificationType;
  body?: any;
  entityId: number;
  entityType: INotificationEntityTypes;
}

@Processor('notification')
export class NotificationConsumer {
  constructor(private readonly prisma: PrismaService) {
    const adminConfig: firebase.ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
    // Initialize the firebase admin app
    firebase.initializeApp({
      credential: firebase.credential.cert(adminConfig),
    });
  }

  @Process(Queues.SendNotification)
  async sendNotification(job: Job<INotificationJobData>, cb: DoneCallback) {
    const isUserDisabledNotification = await this.isUserDisabledNotification(
      job.data.toUser,
      job.data.entityType,
    );

    if (isUserDisabledNotification) return cb(null, true);

    const fcmUser = await this.prisma.fcmNotificationTokens.findFirst({
      where: {
        userId: job.data.toUser,
      },
    });
    await this.saveNotificationToDatabase(job.data);

    if (fcmUser) {
      const notificationTitle = NotificationTitle[
        job.data.notificationType
      ].replace('{0}', job.data.fromUser.username);

      const message = await firebase
        .messaging()
        .sendToDevice(fcmUser.fcmToken, {
          data: {
            entityType: job.data.entityType,
            entityId: String(job.data.entityId),
            link: 'com.derdevam://post/' + job.data.entityId,
          },
          notification: {
            title: notificationTitle,
            body: job.data?.body || '',
          },
        });

      if (message.successCount > 0) {
        return cb(null, true);
      }
    }

    return cb(new Error('Could not find user'), null);
  }

  async saveNotificationToDatabase(data: INotificationJobData) {
    const { toUser, fromUser, notificationType, entityId, entityType } = data;

    await this.prisma.notification.create({
      data: {
        actorId: toUser,
        userId: fromUser.id,
        notificationType,
        readed: false,
        entityId,
        entityType,
      },
    });
  }

  private async isUserDisabledNotification(
    userId: number,
    entityType: INotificationEntity,
  ) {
    const userSettings = await this.prisma.notificationSettings.findUnique({
      where: {
        userId,
      },
    });

    switch (entityType) {
      case INotificationEntity.Follower:
        if (userSettings.follower || !userSettings.disableAll) return true;
      case INotificationEntity.Post:
        if (userSettings.comments || !userSettings.disableAll) return true;
      case INotificationEntity.MessageRequest:
        if (userSettings.messageRequest || !userSettings.disableAll)
          return true;

      default:
        return false;
    }
  }

  @OnQueueStalled()
  async onStalled(job: Job<INotificationJobData>) {
    if (job.isFailed()) {
      console.log(job.failedReason);
    }
  }
  @OnQueueActive()
  onActive(job: Job<INotificationJobData>) {
    console.log('Active job: ', job.id);
  }

  @OnQueueCompleted()
  async onCompleted(job: Job<INotificationJobData>, result) {
    console.log('Completed ', job.id, result);
  }
  @OnQueueError()
  async onError(job: Job<INotificationJobData>, error: Error) {
    console.log('Error ', job.id, error.message);
  }

  @OnQueueFailed()
  onFailed(job: Job<INotificationJobData>, error: Error) {
    console.log('Failed ' + job.id, error);
  }
}
