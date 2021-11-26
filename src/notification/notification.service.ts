import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follower, Notification, Posts } from '@prisma/client';
import { User } from 'src/auth/entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { Repository } from 'typeorm';
import { FcmNotificationUser } from './entities/fcmNotifications.entity';
import { INotificationEntity } from './entities/notification.entity';

type ICustomNotification = Notification & {
  user: User;
  actor: User;
  entity: Follower | Posts;
};

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserNotifications(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        actorId: userId,
        readed: false,
      },
      orderBy: {
        created_at: 'asc',
      },
      include: {
        user: true,
        actor: true,
      },
    });

    notifications.forEach(async (notification: ICustomNotification) => {
      switch (notification.entityType) {
        case INotificationEntity.Post:
          const post = await this.prisma.notification.findFirst({
            where: {
              id: notification.entityId,
            },
            include: {
              actor: true,
              user: true,
            },
          });

          notification.entity = post;
          break;

        case INotificationEntity.Follower:
          const followerEntity = await this.prisma.follower.findFirst({
            where: {
              id: notification.entityId,
            },
            include: {
              actor: true,
              user: true,
            },
          });

          notification.entity = followerEntity;
          break;
      }
    });

    //TODO: entitytype

    return notifications;
  }
  async getUserReadedNotifications(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        actorId: userId,
        readed: true,
      },
      orderBy: {
        created_at: 'asc',
      },
      include: {
        user: true,
        actor: true,
      },
    });

    return notifications;
  }

  async markNotificationAsRead(id: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id },
    });

    if (notification.readed) {
      return false;
    }

    const update = await this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        readed: true,
      },
    });

    if (update) {
      return true;
    }

    return false;
  }

  async saveFcmToken(userId: number, fcmToken: string) {
    const fcmTokenExists = await this.prisma.fcmNotificationTokens.findFirst({
      where: {
        userId,
      },
    });

    if (!fcmTokenExists) {
      await this.prisma.fcmNotificationTokens.create({
        data: {
          fcmToken,
          userId,
        },
      });

      return true;
    } else {
      await this.prisma.fcmNotificationTokens.update({
        where: {
          userId,
        },
        data: {
          fcmToken,
        },
      });

      return true;
    }
  }
}
