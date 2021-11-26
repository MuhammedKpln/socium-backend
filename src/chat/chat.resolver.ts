import { Inject, NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-errors';
import { PubSub } from 'graphql-subscriptions';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ERROR_CODES } from 'src/error_code';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { PUB_SUB } from 'src/pubsub/pubsub.module';
import { StarService } from 'src/star/star.service';
import { ChatService } from './chat.service';
import { MessageRequest } from './entities/messageRequest.entity';
import { Messages } from './entities/messages.entity';
import {
  MESSAGE_REQUEST_ACCEPTED,
  NEW_MESSAGE_REQUEST_SENDED_EVENT,
} from './events.pubsub';

@Resolver((_of) => MessageRequest)
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly starService: StarService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Query((_returns) => [MessageRequest])
  @UseGuards(JwtAuthGuard)
  async messageRequests(
    @Args('pagination') pagination: PaginationParams,
    @UserDecorator() user: User,
  ) {
    return await this.chatService.currentUserRequests(user.id, pagination);
  }

  @Query((_returns) => [MessageRequest])
  @UseGuards(JwtAuthGuard)
  async messageRequestsSended(
    @Args('pagination') pagination: PaginationParams,
    @UserDecorator() user: User,
  ) {
    return await this.chatService.currentUserSendedRequests(user, pagination);
  }

  @Query((_returns) => MessageRequest, {
    nullable: true,
  })
  @UseGuards(JwtAuthGuard)
  async checkForRequests(
    @Args('toUserId') toUserId: number,
    @UserDecorator() user: User,
  ) {
    const availableRequest = await this.chatService.checkForRequest(
      user.id,
      toUserId,
    );

    return availableRequest;
  }

  @Subscription((_returns) => MessageRequest, {
    filter: (payload, variables) =>
      payload.newMessageRequestSended.requestTo.id === variables.toUserId,
  })
  newMessageRequestSended(@Args('toUserId') userId: number) {
    return this.pubSub.asyncIterator(NEW_MESSAGE_REQUEST_SENDED_EVENT);
  }

  @Subscription((_returns) => Messages, {
    filter: (payload, variables) => {
      console.log(payload, variables);

      return payload.messageRequestAccepted.sender.id === variables.toUserId;
    },
  })
  messageRequestAccepted(@Args('toUserId') userId: number) {
    return this.pubSub.asyncIterator(MESSAGE_REQUEST_ACCEPTED);
  }

  @Mutation((_returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async newMessageRequest(
    @Args('toUserId') toUserId: number,
    @UserDecorator() user: User,
  ) {
    const checkForStars = await this.starService.userStars(user.id);

    if (!checkForStars || checkForStars.starCount <= 0) {
      throw new ApolloError('Not enough stars', 'NOT_ENOUGH_STARS', {
        error_code: ERROR_CODES.NOT_ENOUGH_STARS,
      });
    }

    const availableRequest = await this.chatService.checkForRequest(
      user.id,
      toUserId,
    );

    if (availableRequest) {
      throw new ApolloError(
        'REQUEST_ALREADY_EXISTS',
        'REQUEST_ALREADY_EXISTS',
        {
          error_code: ERROR_CODES.REQUEST_ALREADY_EXISTS,
        },
      );
    }

    const create = await this.chatService.createNewMessageRequest(
      user.id,
      toUserId,
    );

    this.pubSub.publish(NEW_MESSAGE_REQUEST_SENDED_EVENT, {
      newMessageRequestSended: create,
    });

    if (create) {
      return true;
    }

    return false;
  }

  @Mutation((_returns) => MessageRequest)
  @UseGuards(JwtAuthGuard)
  async acceptRequest(
    @Args('id') id: number,
    @Args('receiverId') receiverId: number,
    @UserDecorator() user: User,
  ) {
    const model = await this.chatService.answerRequest(id, user.id, receiverId);

    if (!model) {
      throw new ApolloError('COULD_NOT_ACCEPT', 'COULD_NOT_ACCEPT');
    }

    return model;
  }

  @Mutation((_returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async rejectRequest(@Args('id') id: number) {
    if (await this.chatService.rejectRequest(id)) {
      return true;
    }

    throw new NotFoundException();
  }

  @Mutation((_returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async markAllMessagesRead(@Args('roomId') roomId: number) {
    return await this.chatService.markAllMessagesRead(roomId);
  }

  @Mutation((_returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async retrieveMessageRequest(@Args('requestId') requestId: number) {
    return await this.chatService.retrieveMessageRequest(requestId);
  }
}
