import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { EditNotificationSettingsDto } from './dtos/EditNotificationSettings.dto';
import {
  Notification,
  NotificationSettingsEntity,
} from './entities/notification.entity';
import { NotificationService } from './notification.service';

@Resolver((_of) => Notification)
@UseGuards(JwtAuthGuard)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Query((_returns) => [Notification])
  async getNotifications(@UserDecorator() user: User) {
    return await this.notificationService.getUserNotifications(user.id);
  }
  @Query((_returns) => [Notification])
  async getReadedNotifications(@UserDecorator() user: User) {
    return await this.notificationService.getUserReadedNotifications(user.id);
  }
  @Mutation((_returns) => Boolean)
  async markNotificationAsRead(@Args('id') id: number) {
    return await this.notificationService.markNotificationAsRead(id);
  }

  @Mutation((_returns) => Boolean)
  async saveUserFcmToken(
    @UserDecorator() user: User,
    @Args('fcmToken') fcmToken: string,
  ) {
    return await this.notificationService.saveFcmToken(user.id, fcmToken);
  }

  @Mutation((_returns) => Boolean)
  async editNotificationSettings(
    @UserDecorator() user: User,
    @Args('settings') settings: EditNotificationSettingsDto,
  ) {
    const update = await this.notificationService.editNotificationSettings(
      user.id,
      settings,
    );

    if (update) return true;

    return false;
  }

  @Query((_returns) => NotificationSettingsEntity)
  async notificationSettings(@UserDecorator() user: User) {
    return await this.notificationService.notificationSettings(user.id);
  }
}
