import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { response } from 'src/helpers/response';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('stars')
  @UseGuards(JwtAuthGuard)
  async getUserStars(@UserDecorator() user: User) {
    const stars = await this.usersService.getUserStars(user.id);

    if (stars) {
      return response(stars);
    }

    console.log('SEa');
  }

  @Put('stars')
  @UseGuards(JwtAuthGuard)
  async addNewStar(@UserDecorator() user: User) {
    const stars = await this.usersService.addNewStar(user.id);

    if (stars) {
      return response(stars);
    }

    console.log('SEa');
  }

  @Delete('stars')
  @UseGuards(JwtAuthGuard)
  async deleteOneStar(@UserDecorator() user: User) {
    const stars = await this.usersService.deleteOneStar(user.id);

    if (stars) {
      return response(stars);
    }
  }

  @Get(':username')
  async user(@Param('username') username: string) {
    const user = await this.usersService.getUserByUsername(username);

    if (user) {
      return user;
    }

    throw new HttpException(
      {
        status: false,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
