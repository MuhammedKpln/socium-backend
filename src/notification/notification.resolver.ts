import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './notification.service';

@Resolver((_of) => Notification)
@UseGuards(JwtAuthGuard)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Query((_returns) => [Notification])
  async getNotifications(@UserDecorator() user: User) {
    return await this.notificationService.getUserNotifications(user.id);
  }

  @Mutation((_returns) => Boolean)
  async markNotificationAsRead(@Args('id') id: number) {
    return await this.notificationService.markNotificationAsRead(id);
  }
}
