import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { PubSub } from 'graphql-subscriptions';
import { of, skip } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';
import { getRandomString } from 'src/helpers/randomString';
import { PaginationParams } from 'src/inputypes/pagination.input';
import { PUB_SUB } from 'src/pubsub/pubsub.module';
import { PBool } from 'src/types';
import { Not, Repository } from 'typeorm';
import { Star } from '../star/entities/star.entity';
import { ICheckForRoomProps, ISaveMessageProps } from './chat.types';
import { Block } from './entities/block-list.entity';
import { MessageRequest } from './entities/messageRequest.entity';
import { Messages } from './entities/messages.entity';
import { Room } from './entities/room.entity';
import { MESSAGE_REQUEST_ACCEPTED } from './events.pubsub';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    @InjectRepository(Messages) private messageRepo: Repository<Messages>,
    @InjectRepository(MessageRequest)
    private messageRequestRepo: Repository<MessageRequest>,
    @InjectRepository(Block)
    private blockRepo: Repository<Block>,
    @InjectRepository(Star)
    private starRepo: Repository<Star>,
    @InjectQueue('deleteOutdatedMessages') private queue: Queue,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async checkIfUserHasStars(userId: number): Promise<Star | false> {
    const user = new User();
    user.id = userId;

    const result = await this.starRepo.findOne({ user });

    if (result.starCount > 0) {
      return result;
    }

    return false;
  }
  async decreaseStar(userId: number): Promise<boolean> {
    const user = new User();
    user.id = userId;

    const star = await this.starRepo.findOne({ user });

    console.log(star);

    if (star) {
      const update = await this.starRepo.update(
        { user },
        {
          starCount: star.starCount - 1,
        },
      );

      if (update.affected !== 0) {
        return true;
      }
    }

    return false;
  }

  async saveRoom(roomAdress: string): Promise<Room | false> {
    const model = new Room();
    model.roomAdress = roomAdress;

    const save = await this.roomRepo.save(model);

    if (save) {
      return save;
    }

    return false;
  }

  async saveMessage(data: ISaveMessageProps): Promise<Messages> {
    const { message, receiverId, roomAdress, userId, seen } = data;
    const roomAlreadyExists = await this.roomRepo.findOne({ roomAdress });
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
      const model = new Messages();
      const sender = new User();
      sender.id = userId;

      const receiver = new User();
      receiver.id = receiverId;
      model.sender = sender;
      model.receiver = receiver;
      model.message = message;
      model.room = room;
      model.seen = seen;
      return await this.messageRepo.save(model);
    } else {
      // Room does not exists, create and re-save message.
      await this.saveRoom(roomAdress);
      return this.saveMessage(data);
    }
  }

  async checkForExistingRoom(data: ICheckForRoomProps): Promise<Room | false> {
    const { roomAdress } = data;

    const result = await this.roomRepo.findOne({ roomAdress });

    if (result) {
      return result;
    }

    return false;
  }

  async createNewMessageRequest(fromUserId: number, toUserId: number) {
    const fromUser = new User();
    fromUser.id = fromUserId;
    const toUser = new User();
    toUser.id = toUserId;

    const model = new MessageRequest();
    model.requestFrom = fromUser;
    model.requestTo = toUser;

    return await this.messageRequestRepo.save(model);
  }

  async checkForRequest(
    fromUserId: number,
    toUserId: number,
  ): Promise<MessageRequest | false> {
    const fromUser = new User();
    fromUser.id = fromUserId;

    const toUser = new User();
    toUser.id = toUserId;

    const messageRequest = await this.messageRequestRepo.findOne({
      requestFrom: fromUser,
      requestTo: toUser,
    });

    return messageRequest;
  }

  async currentUserSendedRequests(user: User, options: PaginationParams) {
    const messageRequests = await this.messageRequestRepo.find({
      where: {
        requestFrom: {
          id: user.id,
        },
        requestTo: {
          id: Not(user.id),
        },
        request: true,
      },
      relations: ['requestFrom', 'requestTo'],
      take: options.limit,
      skip: options.offset,
    });

    return messageRequests;
  }

  async currentUserRequests(
    userId: number,
    options: PaginationParams,
  ): Promise<MessageRequest[]> {
    const qb = this.messageRequestRepo
      .createQueryBuilder('messageRequest')
      .where('messageRequest.requestTo = :userId', { userId })
      .andWhere('NOT messageRequest.requestFrom = :userId', { userId })
      .andWhere('messageRequest.request = :request', { request: false })
      .leftJoinAndSelect('messageRequest.requestFrom', 'requestFrom')
      .leftJoinAndSelect('messageRequest.requestTo', 'requestTo')
      .offset(options.offset)
      .limit(options.limit);

    return await qb.getMany();
  }

  async answerRequest(id: number, userId: number, receiverId: number) {
    const update = await this.messageRequestRepo.update(
      { id, request: false },
      {
        request: true,
      },
    );

    if (update.affected !== 0) {
      const randomString = getRandomString(10);

      const room = await this.saveRoom(randomString);

      if (room) {
        const user = new User();
        user.id = receiverId;

        const receiver = new User();
        receiver.id = userId;

        const newMessage = new Messages();
        newMessage.sender = user;
        newMessage.receiver = receiver;
        newMessage.message = 'Merhaba! nasılsın ☺️';
        newMessage.seen = false;
        newMessage.room = room;

        const message = await this.messageRepo.save(newMessage);
        this.addQueue(room.id);
        this.pubSub.publish(MESSAGE_REQUEST_ACCEPTED, {
          messageRequestAccepted: message,
        });
        return await this.messageRequestRepo.findOne(id);
      }

      return false;
    }

    return false;
  }
  async rejectRequest(id: number): Promise<boolean> {
    const deleteModel = await this.messageRequestRepo.delete(id);

    if (deleteModel.affected !== 0) {
      return true;
    }

    return false;
  }

  async findMessageRoom(userId: number, options: PaginationParams) {
    const messages = this.messageRepo
      .createQueryBuilder('message')
      .where('message.receiver = :userId', { userId })
      .orWhere('message.sender = :userId', { userId })
      .distinctOn(['message.room'])
      .leftJoinAndSelect('message.room', 'room')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .offset(options.offset)
      .limit(options.limit);

    return await messages.getMany();
  }

  async removeRoom(roomId: number) {
    const deleted = await this.roomRepo.delete({
      id: roomId,
    });

    if (deleted.affected) {
      return true;
    }

    return false;
  }

  async getMessages(roomId: number, pagination: PaginationParams) {
    const { offset, limit } = pagination;
    console.log(offset, limit);

    const messages = this.messageRepo
      .createQueryBuilder('message')
      .where('message.roomId = :roomId', { roomId })
      .leftJoinAndSelect('message.room', 'room')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .offset(offset)
      .addOrderBy('message.created_at', 'DESC')
      .limit(limit);

    const response = await messages.getMany();

    return response.reverse();
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

  async alreadyBlocked(userId: number, actorId: number): Promise<boolean> {
    const user = new User();
    user.id = userId;

    const actor = new User();
    actor.id = actorId;

    const blocked = await this.blockRepo.findOne({
      user,
      actor,
    });

    if (blocked) {
      return true;
    }

    return false;
  }

  async blockUser(userId: number, actorId: number): Promise<boolean> {
    const alreadyBlocked = await this.alreadyBlocked(userId, actorId);
    const user = new User();
    user.id = userId;

    const actor = new User();
    actor.id = actorId;

    if (!alreadyBlocked) {
      const model = await this.blockRepo.create({
        user,
        actor,
      });

      const blocked = await this.blockRepo.save(model);

      if (blocked) {
        return true;
      }
      return false;
    }

    return false;
  }

  async markAllMessagesRead(roomId: number): PBool {
    const unseenMessages = await this.messageRepo.update(
      {
        room: {
          id: roomId,
        },
      },
      {
        seen: true,
      },
    );

    if (unseenMessages.affected > 0) {
      return true;
    }

    return false;
  }

  async retrieveMessageRequest(requestId: number): PBool {
    const deleteRequest = await this.messageRequestRepo.delete({
      id: requestId,
    });

    if (deleteRequest.affected > 0) {
      return true;
    }

    return false;
  }

  async removeMessage(messageId: number): PBool {
    const deleteRequest = await this.messageRepo.delete({
      id: messageId,
    });

    if (deleteRequest.affected > 0) {
      return true;
    }

    return false;
  }
}
