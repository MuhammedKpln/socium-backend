import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  Crud,
  CrudAuth,
  CrudController,
  CrudRequest,
  Override,
  ParsedRequest,
} from '@nestjsx/crud';
import {
  paginate,
  Pagination,
  PaginationTypeEnum,
} from 'nestjs-typeorm-paginate';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { UserLike } from './entities/UserLike.entity';
import { LikesService } from './likes.service';

@Crud({
  model: {
    type: UserLike,
  },

  routes: {
    createOneBase: {
      decorators: [UseGuards(JwtAuthGuard)],
    },
    createManyBase: {
      decorators: [UseGuards(JwtAuthGuard)],
    },
    updateOneBase: {
      decorators: [UseGuards(JwtAuthGuard)],
    },
    deleteOneBase: {
      decorators: [UseGuards(JwtAuthGuard)],
    },
  },
  query: {
    join: {
      isliked: {
        eager: true,
        alias: 'isliked',
      },
      post: {
        eager: true,
        alias: 'post',
      },
      user: {
        eager: true,
        alias: 'user',
      },
      comment: {
        eager: true,
        alias: 'comment',
      },
    },
  },
})
@CrudAuth({
  persist: ({ user }) => ({ user: user?.id }),
})
@Controller('likes')
export class LikesController {
  constructor(public readonly service: LikesService) {}
}
