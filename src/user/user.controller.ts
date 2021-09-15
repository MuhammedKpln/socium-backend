import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}
  @Get(':username')
  async user(@Param('username') username: string) {
    console.log('Selam');
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
