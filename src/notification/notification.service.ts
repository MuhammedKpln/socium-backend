import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { Repository } from 'typeorm';
import { FcmNotificationUser } from './entities/fcmNotifications.entity';
import { Notification } from './entities/notification.entity';

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
    const notification = await this.repo.findOne(id);

    if (notification.readed) {
      return false;
    }

    const update = await this.repo.update(
      {
        id,
      },
      {
        readed: true,
      },
    );

    if (update.affected !== 0) {
      return true;
    }

    return false;
  }

  async saveFcmToken(userId: number, fcmToken: string) {
    const user = new User();
    user.id = userId;

    const fcmTokenExists = await this.fcmRepo.findOne({
      user,
    });

    if (!fcmTokenExists) {
      const model = this.fcmRepo.create({
        fcmToken,
        user,
      });

      await this.fcmRepo.save(model);

      return true;
    } else {
      const model = this.fcmRepo.create({
        ...fcmTokenExists,
        fcmToken,
      });

      await this.fcmRepo.save(model);

      return true;
    }
  }
}
