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
  NotificationTitle,
  NotificationType,
} from '../entities/notification.type';

interface IJobData {
  fromUser: User;
  toUser: number;
  notificationType: NotificationType;
  body: string;
}

@Processor('notification')
export class NotificationConsumer {
  constructor(
    @InjectRepository(FcmNotificationUser)
    private readonly fcmRepo: Repository<FcmNotificationUser>,
  ) {
    console.log(process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'));
    console.log(process.env.FIREBASE_PRIVATE_KEY);
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
  async sendVerificationMail(job: Job<IJobData>, cb: DoneCallback) {
    const user = new User();
    user.id = job.data.toUser;

    const fcmUser = await this.fcmRepo.findOne({
      user,
    });

    if (fcmUser) {
      const notificationTitle = NotificationTitle[
        job.data.notificationType
      ].replace('{0}', job.data.fromUser.username);

      const message = await firebase
        .messaging()
        .sendToDevice(fcmUser.fcmToken, {
          notification: {
            title: notificationTitle,
            body: job.data?.body || undefined,
          },
        });

      if (message.successCount > 0) {
        return cb(null, true);
      }
    }

    await job.moveToFailed(new Error('User not found'));
    return cb(new Error('Could not find user'));
  }

  @OnQueueStalled()
  async onStalled(job: Job<IJobData>) {
    await job.moveToFailed(new Error('User not found'));
    if (job.isFailed()) {
      console.log(job.failedReason);
    }
  }
  @OnQueueActive()
  onActive(job: Job<IJobData>) {
    console.log('Active job: ', job.id);
  }

  @OnQueueCompleted()
  async onCompleted(job: Job<IJobData>, result) {
    console.log('Completed ', job.id, result);
  }
  @OnQueueError()
  async onError(job: Job<IJobData>, error: Error) {
    console.log('Error ', job.id, error.message);
  }

  @OnQueueFailed()
  onFailed(job: Job<IJobData>, error: Error) {
    console.log('Failed ' + job.id, error);
  }
}
