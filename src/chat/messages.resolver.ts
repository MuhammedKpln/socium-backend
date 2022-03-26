import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { PubsubModule, PUB_SUB } from 'src/pubsub/pubsub.module';
import { ChatService } from './chat.service';
import { Messages } from './entities/messages.entity';
import { Room } from './entities/room.entity';
import { MESSAGE_SENDED } from './events.pubsub';

@Resolver((_of) => Messages)
export class MessagesResolver {
  constructor(
    private chatService: ChatService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Query((_returns) => [Messages])
  @UseGuards(JwtAuthGuard)
  async messages(
    @UserDecorator() user: User,
    @Args('pagination') pagination: PaginationParams,
  ) {
    const roomsService = await this.chatService.findMessageRoom(
      user.id,
      pagination,
    );

    return roomsService;
  }

  @Query((_returns) => [Messages])
  @UseGuards(JwtAuthGuard)
  async messagesFromRoom(
    @Args('roomId') roomId: number,
    @Args('pagination') pagination: PaginationParams,
  ) {
    const roomsService = await this.chatService.getMessages(roomId, pagination);
    return roomsService;
  }

  @Mutation((_returns) => Room)
  @UseGuards(JwtAuthGuard)
  async deleteRoom(@Args('roomId') roomId: number) {
    const roomsService = await this.chatService.removeRoom(roomId);
    return roomsService;
  }

  @Subscription((_returns) => Messages, {
    filter: (payload, variables) =>
      payload.messageSended.receiver.id === variables.userId,
  })
  async messageSended(@Args('userId') _userId: number) {
    return this.pubSub.asyncIterator(MESSAGE_SENDED);
  }
}
