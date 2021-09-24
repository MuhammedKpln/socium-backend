import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotAcceptableException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ERROR_CODES } from 'src/error_code';
import { response } from 'src/helpers/response';
import { ChatService } from './chat.service';
import { CreateRequestDto } from './dtos/CreateRequest.dto';
import { NewMessageDto } from './dtos/NewMessage.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}
  @Get('requests')
  async currentUserRequests(
    @UserDecorator() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Req() req,
  ) {
    limit = parseInt(process.env.PAGINATION_LIMIT) || limit;
    const routePath = req.url;
    const paginationOptions = {
      limit,
      page,
      route: routePath,
    };

    console.log('SAdaqd');

    return await this.chatService.currentUserRequests(
      user.id,
      paginationOptions,
    );
  }

  @Get('requests/sended')
  async currentUserSendedRequests(
    @UserDecorator() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Req() req,
  ) {
    limit = parseInt(process.env.PAGINATION_LIMIT) || limit;
    const routePath = req.url;
    const paginationOptions = {
      limit,
      page,
      route: routePath,
    };

    return await this.chatService.currentUserSendedRequests(
      user.id,
      paginationOptions,
    );
  }

  @Get('requests/check/:toUserId')
  async checkForRequests(
    @UserDecorator() user: User,
    @Param('toUserId') toUserId: number,
  ) {
    const availableRequest = await this.chatService.checkForRequest(
      user.id,
      toUserId,
    );

    console.log(availableRequest);
    if (availableRequest) {
      return availableRequest;
    }

    throw new NotFoundException();
  }

  @Post('new')
  async newRequest(
    @Body() { toUserId }: CreateRequestDto,
    @UserDecorator() user: User,
  ) {
    const checkForStars = await this.chatService.checkIfUserHasStars(user.id);
    if (!checkForStars) {
      throw new NotAcceptableException({
        error_code: ERROR_CODES.NOT_ENOUGH_STARS,
      });
    }

    const availableRequest = await this.chatService.checkForRequest(
      user.id,
      toUserId,
    );

    if (availableRequest) {
      throw new NotAcceptableException({
        error_code: ERROR_CODES.REQUEST_ALREADY_EXISTS,
      });
    }

    return await this.chatService.createNewMessageRequest(user.id, toUserId);
  }

  @Put('accept/:id/:receiverId')
  async acceptRequest(
    @Param('id') id: number,
    @Param('receiverId') receiverId: number,
    @UserDecorator() user: User,
  ) {
    const model = await this.chatService.answerRequest(id, user.id, receiverId);

    if (!model) {
      throw new NotAcceptableException({
        selam: 'aselam',
      });
    }

    return model;
  }

  @Delete('reject/:id')
  async rejectRequest(@Param('id') id: number) {
    if (await this.chatService.rejectRequest(id)) {
      return response({
        deleted: true,
      });
    }

    throw new NotAcceptableException();
  }

  @Get('messages')
  async messages(
    @UserDecorator() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Req() req,
  ) {
    console.log(limit);
    const routePath = req.url;
    const paginationOptions = {
      limit,
      page,
      route: routePath,
    };

    const roomsService = await this.chatService.findMessageRoom(
      user.id,
      paginationOptions,
    );

    return roomsService;
  }

  @Get('messages/:roomId')
  async messagesByRoom(
    @Param('roomId') roomId: number,
    @UserDecorator() user: User,
  ) {
    const roomsService = await this.chatService.getMessages(user.id, roomId);

    return roomsService;
  }

  @Post('messages')
  async sendNewMessage(
    @UserDecorator() user: User,
    @Body() message: NewMessageDto,
  ) {
    return await this.chatService.saveMessage({
      message: message.message,
      receiverId: message.receiverId,
      userId: message.userId,
      roomAdress: message.roomAdress,
      seen: false,
    });
  }
}
