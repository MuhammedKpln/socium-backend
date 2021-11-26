import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { MessageRequest, Room } from '@prisma/client';
import { Queue } from 'bull';
import { PubSub } from 'graphql-subscriptions';
import { User } from 'src/auth/entities/user.entity';
import { getRandomString } from 'src/helpers/randomString';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { PUB_SUB } from 'src/pubsub/pubsub.module';
import { P } from 'src/types';
import { ICheckForRoomProps, ISaveMessageProps } from './chat.types';
import { MESSAGE_REQUEST_ACCEPTED } from './events.pubsub';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('deleteOutdatedMessages') private queue: Queue,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async saveRoom(roomAdress: string): Promise<Room | false> {
    const save = await this.prisma.room.create({
      data: {
        roomAdress,
      },
    });

    if (save) {
      return save;
    }

    return false;
  }

  private async addQueue(roomId: number) {
    await this.queue.add(
      {
        roomId,
      },
      {
        delay: 86400000,
      },
    );
  }

  async saveMessage(data: ISaveMessageProps) {
    const { message, receiverId, roomAdress, userId, seen } = data;
    const roomAlreadyExists = await this.prisma.room.findFirst({
      where: { roomAdress },
    });

    let room: Room;

    if (roomAlreadyExists) {
      room = roomAlreadyExists;
    } else {
      const newRoom = await this.saveRoom(roomAdress);
      if (newRoom) {
        room = newRoom;
      }
    }

    if (room) {
      return await this.prisma.messages.create({
        data: {
          senderId: userId,
          receiverId,
          message,
          seen,
          roomId: room.id,
        },
        include: {
          room: true,
        },
      });
    } else {
      // Room does not exists, create and re-save message.
      await this.saveRoom(roomAdress);
      return this.saveMessage(data);
    }
  }

  async checkForExistingRoom(data: ICheckForRoomProps): Promise<Room | false> {
    const { roomAdress } = data;

    const result = await this.prisma.room.findFirst({
      where: { roomAdress },
    });

    if (result) {
      return result;
    }

    return false;
  }

  async createNewMessageRequest(
    fromUserId: number,
    toUserId: number,
  ): P<MessageRequest> {
    return await this.prisma.messageRequest.create({
      data: {
        requestFromId: fromUserId,
        requestToId: toUserId,
      },
    });
  }

  async checkForRequest(
    fromUserId: number,
    toUserId: number,
  ): Promise<MessageRequest | false> {
    const messageRequest = await this.prisma.messageRequest.findFirst({
      where: {
        requestFromId: fromUserId,
        requestToId: toUserId,
      },
    });

    return messageRequest;
  }

  async currentUserSendedRequests(
    user: User,
    options: PaginationParams,
  ): P<MessageRequest[]> {
    const messageRequests = await this.prisma.messageRequest.findMany({
      where: {
        requestFromId: user.id,
        requestToId: {
          not: user.id,
        },
        request: true,
      },
      include: {
        requestFrom: true,
        requestTo: true,
      },
      take: options.limit,
      skip: options.offset,
    });

    return messageRequests;
  }

  async currentUserRequests(
    userId: number,
    options: PaginationParams,
  ): Promise<MessageRequest[]> {
    const messageRequests = await this.prisma.messageRequest.findMany({
      where: {
        requestToId: userId,
        requestFromId: {
          not: userId,
        },
        request: true,
      },
      include: {
        requestFrom: true,
        requestTo: true,
      },
      take: options.limit,
      skip: options.offset,
    });

    return messageRequests;
  }

  async answerRequest(
    id: number,
    userId: number,
    receiverId: number,
  ): P<MessageRequest | false> {
    const update = await this.prisma.messageRequest.update({
      where: { id },
      data: {
        request: false,
      },
    });

    if (update) {
      const randomString = getRandomString(10);

      const room = await this.saveRoom(randomString);

      if (room) {
        const message = await this.saveMessage({
          message: 'Merhaba! nasılsın ☺️',
          receiverId,
          userId,
          seen: false,
          roomAdress: room.roomAdress,
        });

        this.addQueue(room.id);
        this.pubSub.publish(MESSAGE_REQUEST_ACCEPTED, {
          messageRequestAccepted: message,
        });

        return update;
      }

      return false;
    }

    return false;
  }
  async rejectRequest(id: number): Promise<boolean> {
    const deleteModel = await this.prisma.messageRequest.delete({
      where: { id },
    });

    if (deleteModel) {
      return true;
    }

    return false;
  }

  async findMessageRoom(userId: number, options: PaginationParams) {
    const messageRooms = await this.prisma.messages.findMany({
      where: {
        receiverId: userId,
        OR: {
          senderId: userId,
        },
      },
      include: {
        receiver: true,
        room: true,
        sender: true,
      },
      take: options.limit,
      skip: options.offset,
      distinct: 'roomId',
    });

    return messageRooms;
  }

  // async removeRoom(roomId: number) {
  //   const deleted = await this.roomRepo.delete({
  //     id: roomId,
  //   });

  //   if (deleted.affected) {
  //     return true;
  //   }

  //   return false;
  // }

  // async getMessages(roomId: number, pagination: PaginationParams) {
  //   const { offset, limit } = pagination;
  //   console.log(offset, limit);

  //   const messages = this.messageRepo
  //     .createQueryBuilder('message')
  //     .where('message.roomId = :roomId', { roomId })
  //     .leftJoinAndSelect('message.room', 'room')
  //     .leftJoinAndSelect('message.sender', 'sender')
  //     .leftJoinAndSelect('message.receiver', 'receiver')
  //     .offset(offset)
  //     .addOrderBy('message.created_at', 'DESC')
  //     .limit(limit);

  //   const response = await messages.getMany();

  //   return response.reverse();
  // }

  // private async addQueue(roomId: number) {
  //   await this.queue.add(
  //     {
  //       roomId,
  //     },
  //     {
  //       delay: 86400000,
  //     },
  //   );
  // }

  // async alreadyBlocked(userId: number, actorId: number): Promise<boolean> {
  //   const user = new User();
  //   user.id = userId;

  //   const actor = new User();
  //   actor.id = actorId;

  //   const blocked = await this.blockRepo.findOne({
  //     user,
  //     actor,
  //   });

  //   if (blocked) {
  //     return true;
  //   }

  //   return false;
  // }

  // async blockUser(userId: number, actorId: number): Promise<boolean> {
  //   const alreadyBlocked = await this.alreadyBlocked(userId, actorId);
  //   const user = new User();
  //   user.id = userId;

  //   const actor = new User();
  //   actor.id = actorId;

  //   if (!alreadyBlocked) {
  //     const model = await this.blockRepo.create({
  //       user,
  //       actor,
  //     });

  //     const blocked = await this.blockRepo.save(model);

  //     if (blocked) {
  //       return true;
  //     }
  //     return false;
  //   }

  //   return false;
  // }

  // async markAllMessagesRead(roomId: number): PBool {
  //   const unseenMessages = await this.messageRepo.update(
  //     {
  //       room: {
  //         id: roomId,
  //       },
  //     },
  //     {
  //       seen: true,
  //     },
  //   );

  //   if (unseenMessages.affected > 0) {
  //     return true;
  //   }

  //   return false;
  // }

  // async retrieveMessageRequest(requestId: number): PBool {
  //   const deleteRequest = await this.messageRequestRepo.delete({
  //     id: requestId,
  //   });

  //   if (deleteRequest.affected > 0) {
  //     return true;
  //   }

  //   return false;
  // }

  // async removeMessage(messageId: number): PBool {
  //   const deleteRequest = await this.messageRepo.delete({
  //     id: messageId,
  //   });

  //   if (deleteRequest.affected > 0) {
  //     return true;
  //   }

  //   return false;
  // }
}
