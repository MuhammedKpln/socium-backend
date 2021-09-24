import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudAuth } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './notification.service';

@Crud({
  model: {
    type: Notification,
  },
  query: {
    join: {
      user: {
        eager: true,
      },
      actor: {
        eager: true,
      },
    },
  },
  routes: {
    createOneBase: {
      decorators: [UseGuards(JwtAuthGuard)],
    },
    getManyBase: {
      decorators: [UseGuards(JwtAuthGuard)],
    },
    deleteOneBase: {
      decorators: [UseGuards(JwtAuthGuard)],
    },
    updateOneBase: {
      decorators: [UseGuards(JwtAuthGuard)],
    },
    only: ['createOneBase', 'getManyBase', 'deleteOneBase', 'updateOneBase'],
  },
})
@CrudAuth({
  persist: ({ user }) => ({ user: user?.id }),
  filter: ({ user }) => ({
    'actor.id': user.id,
    readed: false,
  }),
})
@Controller('notification')
export class NotificationController {
  constructor(public readonly service: NotificationService) {}
}
