import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  OnQueueStalled,
  Process,
  Processor,
} from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { DoneCallback, Job } from 'bull';
import * as firebase from 'firebase-admin';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { FcmNotificationUser } from '../entities/fcmNotifications.entity';
import {
  INotificationEntityTypes,
  Notification,
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
  constructor(
    @InjectRepository(FcmNotificationUser)
    private readonly fcmRepo: Repository<FcmNotificationUser>,

    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {
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

  @Process('sendNotification')
  async sendVerificationMail(job: Job<INotificationJobData>, cb: DoneCallback) {
    console.log('SAQ');
    const user = new User();
    user.id = job.data.toUser;

    const fcmUser = await this.fcmRepo.findOne({
      user,
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
    console.log('WSSS');
    const toUserModel = new User();
    toUserModel.id = toUser;

    const model = this.notificationRepo.create({
      actor: toUserModel,
      user: fromUser,
      notificationType,
      readed: false,
      entityId,
      entityType,
    });

    await this.notificationRepo.save(model);
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
