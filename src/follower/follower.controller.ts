import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/auth/decorators/user.decorator';
import { User as UserEntity } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { response } from 'src/helpers/response';
import { STATUS_CODE } from 'src/status_code';
import { FollowerService } from './follower.service';

@Controller('follower')
export class FollowerController {
  constructor(private readonly followersService: FollowerService) {}

  @Post(':actor')
  @UseGuards(JwtAuthGuard)
  async follow(
    @Param('actor', ParseIntPipe) actorId: number,
    @User() user: UserEntity,
  ) {
    const followed = await this.followersService.followUser(user, actorId);

    if (followed) {
      return response({
        status: true,
        status_code: STATUS_CODE.FOLLOWED_USER,
      });
    }

    return response({
      status: false,
      status_code: STATUS_CODE.ALREADY_FOLLOWING_USER,
    });
  }
  @Delete(':actor')
  @UseGuards(JwtAuthGuard)
  async unfollow(
    @Param('actor', ParseIntPipe) actorId: number,
    @User() user: UserEntity,
  ) {
    const unFollowed = await this.followersService.unFollowUser(user, actorId);

    if (unFollowed) {
      return response({
        status: true,
        status_code: STATUS_CODE.FOLLOWED_USER,
      });
    }

    return response({
      status: false,
      status_code: STATUS_CODE.NOT_FOLLOWING_USER,
    });
  }
}
