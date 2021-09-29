import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-errors';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ERROR_CODES } from 'src/error_code';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { ChatService } from './chat.service';
import { MessageRequest } from './entities/messageRequest.entity';

@Resolver((_of) => MessageRequest)
@UseGuards(JwtAuthGuard)
export class ChatResolver {
  constructor(private chatService: ChatService) {}

  @Query((_returns) => [MessageRequest])
  async messageRequests(
    @Args('pagination') pagination: PaginationParams,
    @UserDecorator() user: User,
  ) {
    return await this.chatService.currentUserRequests(user.id, pagination);
  }

  @Query((_returns) => [MessageRequest])
  async messageRequestsSended(
    @Args('pagination') pagination: PaginationParams,
    @UserDecorator() user: User,
  ) {
    return await this.chatService.currentUserSendedRequests(
      user.id,
      pagination,
    );
  }

  @Query((_returns) => MessageRequest)
  async checkForRequests(
    @Args('toUserId') toUserId: number,
    @UserDecorator() user: User,
  ) {
    const availableRequest = await this.chatService.checkForRequest(
      user.id,
      toUserId,
    );

    if (availableRequest) {
      return availableRequest;
    }

    throw new ApolloError('Request not found', 'NOT_FOUND', {
      error_code: ERROR_CODES.REQUEST_NOT_FOUND,
    });
  }

  @Mutation((_returns) => Boolean)
  async newMessageRequest(
    @Args('toUserId') toUserId: number,
    @UserDecorator() user: User,
  ) {
    const checkForStars = await this.chatService.checkIfUserHasStars(user.id);
    console.log(checkForStars);
    if (!checkForStars) {
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

    const create = this.chatService.createNewMessageRequest(user.id, toUserId);

    if (create) {
      return true;
    }

    return false;
  }

  @Mutation((_returns) => MessageRequest)
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
  async rejectRequest(@Args('id') id: number) {
    if (await this.chatService.rejectRequest(id)) {
      return true;
    }

    throw new NotFoundException();
  }
}
