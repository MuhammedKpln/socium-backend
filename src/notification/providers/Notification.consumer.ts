import { MailerService } from '@nestjs-modules/mailer';
import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import { DoneCallback, Job } from 'bull';
import {
  NotificationTitle,
  NotificationType,
} from '../entities/notification.type';
import * as firebase from 'firebase-admin';
import { InjectRepository } from '@nestjs/typeorm';
import { FcmNotificationUser } from '../entities/fcmNotifications.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

interface IJobData {
  fromUser: User;
  toUser: number;
  notificationType: NotificationType;
  body: string;
}

@Processor('sendNotification')
export class NotificationConsumer {
  constructor(
    @InjectRepository(FcmNotificationUser)
    private readonly fcmRepo: Repository<FcmNotificationUser>,
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

  @Process('notification')
  async sendVerificationMail(job: Job<IJobData>, cb) {
    const user = new User();
    user.id = job.data.toUser;

    const fcmUser = await this.fcmRepo.findOne({
      user,
    });

    if (fcmUser) {
      const notificationTitle = NotificationTitle[
        job.data.notificationType
      ].replace('{0}', job.data.fromUser.username);

      await firebase.messaging().sendToDevice(fcmUser.fcmToken, {
        notification: {
          title: notificationTitle,
          body: job.data.body,
        },
      });
    }
  }
}
