import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { User } from 'src/auth/entities/user.entity';
import { getRandomString } from 'src/helpers/randomString';
import { Not, Repository } from 'typeorm';
import { ICheckForRoomProps, ISaveMessageProps } from './chat.types';
import { MessageRequest } from './entities/messageRequest.entity';
import { Messages } from './entities/messages.entity';
import { Room } from './entities/room.entity';
import { Star } from '../star/entities/star.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    @InjectRepository(Messages) private messageRepo: Repository<Messages>,
    @InjectRepository(MessageRequest)
    private messageRequestRepo: Repository<MessageRequest>,
    @InjectRepository(Star)
    private starRepo: Repository<Star>,
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

  async checkForRequest(fromUserId: number, toUserId: number) {
    const fromUser = new User();
    fromUser.id = fromUserId;

    const toUser = new User();
    toUser.id = toUserId;

    return await this.messageRequestRepo.findOne({
      requestFrom: fromUser,
      requestTo: toUser,
    });
  }

  async currentUserSendedRequests(userId: number, options: IPaginationOptions) {
    const qb = this.messageRequestRepo.createQueryBuilder('message');
    qb.where('message.requestFromId = :userId', { userId });
    qb.leftJoinAndSelect('message.requestFrom', 'requestFrom');
    qb.leftJoinAndSelect('message.requestTo', 'requestTo');
    return paginate(qb, options);
  }

  async currentUserRequests(userId: number, options: IPaginationOptions) {
    const qb = this.messageRequestRepo
      .createQueryBuilder('message')
      .where('message.requestToId = :userId', { userId })
      .where('message.requestFromId != :userId', { userId })
      .where('message.request = :request', { request: false })
      .leftJoinAndSelect('message.requestFrom', 'requestFrom')
      .leftJoinAndSelect('message.requestTo', 'requestTo');

    console.log(await qb.getMany());

    return paginate(qb, options);
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

        await this.messageRepo.save(newMessage);

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

  async findMessageRoom(userId: number, options: IPaginationOptions) {
    const messages = this.messageRepo
      .createQueryBuilder('message')
      .where('message.receiver = :userId', { userId })
      .orWhere('message.sender = :userId', { userId })
      .leftJoinAndSelect('message.room', 'room')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .addGroupBy('message.room')
      .addGroupBy('message.id')
      .addGroupBy('room.id')
      .addGroupBy('sender.id')
      .addGroupBy('receiver.id');

    return paginate(messages, options);
  }

  async getMessages(userId: number, roomId: number) {
    const messages = this.messageRepo
      .createQueryBuilder('message')
      .where('message.senderId = :userId', { userId })
      .orWhere('message.receiver = :userId', { userId })
      .where('message.roomId = :roomId', { roomId })
      .leftJoinAndSelect('message.room', 'room')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .orderBy('message.created_at', 'ASC');

    return await messages.getMany();
  }
}
