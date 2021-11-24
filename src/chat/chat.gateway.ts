import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as firebase from 'firebase-admin';
import { RedisClient } from 'redis';
import { Server, Socket } from 'socket.io';
import { redisClient, redisUrl } from 'src/main';
import { FcmNotificationUser } from 'src/notification/entities/fcmNotifications.entity';
import { Repository } from 'typeorm';
import { rangeNumber, shuffleArray } from '../helpers';
import { ChatService } from './chat.service';
import {
  ICallAnswer,
  ICallOffer,
  IData,
  IRemoveMessageRequest,
  IRoomMessage,
  ISendMessage,
  ITypingData,
} from './chat.types';

@WebSocketGateway({
  cors: true,
  namespace: 'PairingScreen',
})
export class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection {
  private redis: RedisClient;
  constructor(
    private chatService: ChatService,
    @InjectRepository(FcmNotificationUser)
    private readonly fcmRepo: Repository<FcmNotificationUser>,
  ) {
    this.redis = new RedisClient({
      url: redisUrl,
      db: 3,
    });
  }

  private logger: Logger = new Logger();

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinQueue')
  async joinQueue(client: Socket, data: IData) {
    this.redis.llen('pool', (err, reply) => {
      this.redis.lrange('pool', 0, reply, (err, reply) => {
        const shuffledTellers = shuffleArray(reply);
        const randomNumber = rangeNumber(0, reply.length - 1);
        const pairedClient = shuffledTellers[randomNumber];
        const randomRoomName =
          Math.floor(Math.random() * 1000) + pairedClient + client.id;

        if (!pairedClient) {
          this.redis.lpush('pool', client.id);
          return false;
        }

        const redisRoomName = `rooms:${randomRoomName}`;

        this.redis.set(
          redisRoomName,
          JSON.stringify({
            room: randomRoomName,
            users: [pairedClient, client.id],
          }),
        );
        this.redis.expire(redisRoomName, 3600);

        client.emit('clientPaired', {
          clientId: pairedClient,
          roomName: randomRoomName,
        });

        this.server.to(pairedClient).emit('clientPaired', {
          clientId: client.id,
          roomName: randomRoomName,
        });

        this.redis.lrem('pool', 0, pairedClient);
      });
    });
  }
  // }

  @SubscribeMessage('join room')
  async joinRoom(client: Socket, data: IRoomMessage) {
    client.join(data.roomName);

    if (data.pairedClientId) {
      this.server.to(data.pairedClientId).emit('user', data.user);
    } else {
      client.emit('user', data.user);
    }
  }

  @SubscribeMessage('leave queue')
  async leaveQueue(client: Socket) {
    this.redis.lrem('pool', 0, client.id);
  }

  @SubscribeMessage('leave room')
  async leaveRoom(client: Socket, data: IRoomMessage) {
    this.server.to(data.roomName).emit('client disconnected');
    this.redis.del(`rooms:${data.roomName}`);
    client.leave(data.roomName);
  }

  @SubscribeMessage('seen status')
  async handleSeenStatus1(
    client: Socket,
    data: { seen: boolean; roomAdress: string; roomId: number },
  ) {
    if (data.seen) {
      client.broadcast.to(data.roomAdress).emit('seen status updated', {
        seen: true,
      });

      await this.chatService.markAllMessagesRead(data.roomId);
    }
  }

  @SubscribeMessage('send message')
  async handleNewMessage(client: Socket, data: ISendMessage) {
    const { message, roomName, user, receiver } = data;

    if (message) {
      const splittedMessage = message.split(' ');
      const abuseDetected = await this.abuseDetector(splittedMessage);

      if (!abuseDetected) {
        const date = new Date();
        const seen = false;

        const m = await this.chatService.saveMessage({
          message,
          receiverId: receiver.id,
          userId: user.id,
          roomAdress: roomName,
          seen,
        });

        const fcmUser = await this.fcmRepo.findOne({
          user: receiver,
        });

        if (fcmUser) {
          await firebase.messaging().sendToDevice(fcmUser.fcmToken, {
            data: {
              entityType: 'message',
              entityId: String(m.room.id),
              link: 'com.derdevam://message-room/' + m.room.id,
            },
            notification: {
              title: user.username + ' kullanicisindan yeni bir mesajiniz var',
              body: message,
            },
          });
        }

        this.server.to(data.roomName).emit('message', {
          message: message,
          clientId: client.id,
          date,
          user,
          receiver,
          roomName,
          id: m.id,
          roomId: m.room.id,
        });
      } else {
        this.server.to(client.id).emit('abuse is detected');
      }
    }
  }

  @SubscribeMessage('call-user')
  handleCall(client: Socket, data: ICallOffer) {
    this.logger.log('Call made', data);
    this.server.to(data.to).emit('call-made', {
      offer: data.offer,
      socket: client.id,
    });
  }

  @SubscribeMessage('make-answer')
  handleCallAnswer(client: Socket, data: ICallAnswer) {
    this.logger.log('answer made');
    this.server.to(data.to).emit('answer-made', {
      answer: data.answer,
      socket: client.id,
    });
  }

  @SubscribeMessage('user is typing')
  handleTyping(client: Socket, data: ITypingData) {
    return client.broadcast.emit('user is done with typing', {
      typing: data.typing,
      roomAdress: data.roomAdress,
    });
  }

  @SubscribeMessage('hang up call')
  handleCloseCall(client: Socket, data: { to: string }) {
    return client.to(data.to).emit('user hanged up call', {
      hangup: true,
    });
  }

  @SubscribeMessage('call retrieve request')
  callingRetrived(client: Socket, { to }) {
    console.log('call is retrived', to);
    return this.server.to(to).emit('call is retrieved');
  }

  @SubscribeMessage('user connected')
  userConnected(client: Socket, data) {
    console.log('userConnected', data, client.id);

    this.redis.set(client.id + ':' + data.user.id, JSON.stringify(data.user));
    this.redis.expire(client.id + ':' + data.user.id, 3600);
  }
  @SubscribeMessage('user is already connected')
  userIsAlreadyConnected(client: Socket, data) {
    this.redis.scan('0', 'MATCH', '*:' + data.userId, (err, reply) => {
      if (err) return;

      if (reply.length > 0) {
        const clientId = reply[1][0];

        if (clientId) {
          return client.emit('user is online', {
            status: true,
          });
        } else {
          return client.emit('user is online', {
            status: false,
          });
        }
      }
      console.log(reply);
    });
  }

  private async abuseDetector(messages: string[]): Promise<boolean> {
    const abuseDetectedMessages: string[] = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      redisClient.get(message.toLowerCase(), (err, key) => {
        if (key && !err) {
          abuseDetectedMessages.push(key);
        }
      });
    }

    if (abuseDetectedMessages.length > 0) {
      return true;
    }

    return false;
  }

  @SubscribeMessage('remove single message request')
  async handleRemoveMessage(
    client: Socket,
    { messageId }: IRemoveMessageRequest,
  ) {
    const [, roomAdress] = client.rooms;

    this.server.to(roomAdress).emit('remove message requested', { messageId });

    await this.chatService.removeMessage(messageId);
  }

  @SubscribeMessage('get online users count')
  async onlineUsers(client: Socket) {
    const sockets = await this.server.fetchSockets();

    this.server.emit('online users', {
      count: sockets.length,
    });
  }

  async handleConnection(client: Socket) {
    this.logger.log('user connected');
    // this.onlineUsers(client);

    // const verified = await this.authService.validateJwt(
    //   client.handshake.headers.authorization,
    // );

    // !verified && client.disconnect();
  }

  async handleDisconnect(client: Socket) {
    const sockets = await this.server.fetchSockets();

    // If user has/joined a room, delete it.
    this.redis.scan('0', 'MATCH', `rooms:*${client.id}*`, (err, reply) => {
      if (err) console.log(err);

      if (!reply[0][1]) return;

      const roomName = reply[0][1][0];

      this.redis.del(roomName);
    });

    // If user is in pool, remove it.
    this.redis.lrem('pool', 0, client.id);

    // Update online users count
    this.server.emit('online users', {
      count: sockets.length,
    });

    // On disconnect delete user key.
    this.redis.scan('0', 'MATCH', client.id + ':*', (err, reply) => {
      if (err) return;

      if (reply.length > 0) {
        const clientId = reply[1][0];

        if (clientId) {
          this.redis.del(clientId);
        }
      }
    });

    this.logger.log('user disconnected');
  }
}
