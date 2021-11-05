import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { ChatService } from './chat.service';
import { Messages } from './entities/messages.entity';

@ObjectType()
export class CustomMessagesEntity {
  @Field()
  room: number;
  @Field()
  message: string;
  @Field()
  senderId: number;
  @Field()
  receiverId: number;
  @Field()
  sender: string;
  @Field()
  receiver: string;
  @Field()
  seen: string;
}

@Resolver((_of) => Messages)
@UseGuards(JwtAuthGuard)
export class MessagesResolver {
  constructor(private chatService: ChatService) {}

  @Query((_returns) => [Messages])
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
  async messagesFromRoom(
    @Args('roomId') roomId: number,
    @Args('pagination') pagination: PaginationParams,
  ) {
    const roomsService = await this.chatService.getMessages(roomId, pagination);

    return roomsService;
  }

  @Mutation((_returns) => Boolean)
  async deleteRoom(@Args('roomId') roomId: number) {
    const roomsService = await this.chatService.removeMessage(roomId);

    return roomsService;
  }
}
