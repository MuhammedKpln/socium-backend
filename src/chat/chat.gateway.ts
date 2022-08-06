import { Inject, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RedisClient } from 'redis';
import { rangeNumber, shuffleArray } from 'src/helpers';
import { getRandomString } from 'src/helpers/randomString';
import { redisUrl } from 'src/main';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatService } from './chat.service';
import {
  IAddIceCandidate,
  IAnswerMediaControl,
  IAskForMediaPermission,
  ICallAnswer,
  ICallData,
  IJoinQueue,
  IMicMuted,
  IPool,
  IRemoveMessageRequest,
  IResponseEvents,
  IRetrieveCall,
  ISendMessage,
} from './chat.types';
import * as firebase from 'firebase-admin';
import { PUB_SUB } from 'src/pubsub/pubsub.module';
import { PubSub } from 'graphql-subscriptions';
import { MESSAGE_SENDED } from './events.pubsub';
import { Messages } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { SocketType } from 'dgram';

@WebSocketGateway(3001)
export class ChatGateway implements OnGatewayConnection {
  private redis: RedisClient;
  private pool: IPool[] = [];
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private readonly prisma: PrismaService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {
    this.redis = new RedisClient({
      url: redisUrl,
      db: 3,
    });
  }

  private eventHandler = (event: string, data?: any) => {
    return JSON.stringify({
      event,
      data,
    });
  };

  private pair(socket: Socket) {
    return new Promise((resolve, reject) => {
      const random = rangeNumber(0, this.pool.length - 1);
      const user = this.pool.find((id) => id.uuid === socket.id);

      if (this.pool[random].uuid !== socket.id) {
        const connectedSocket = this.pool[random];
        const genRoom = getRandomString(10);

        try {
          console.log('user', user.user);
          console.log('user', user.uuid);
          this.server
            .to(connectedSocket.uuid)
            .emit(IResponseEvents.ClientPaired, {
              room: genRoom,
              user: user.user,
              uuid: socket.id,
            });

          resolve({
            room: genRoom,
            connectedUser: connectedSocket.user,
            uuid: connectedSocket.uuid,
          });

          this.pool = this.pool.filter((id) => {
            if (id.uuid !== socket.id && id.uuid !== this.pool[random].uuid) {
              return id;
            }
          });
        } catch (error) {
          reject('OLMADI');
        }
      }

      reject('ss');
    });
  }

  @SubscribeMessage('join queue')
  handleJoinQueue(socket: Socket, data: IJoinQueue) {
    const alreadyInQueue = this.pool.find((id) => id.uuid === socket.id);
    if (alreadyInQueue) {
      console.log('Already in queue');
      console.log(this.pool);
    } else {
      this.pool.push({
        uuid: socket.id,
        user: data.user,
      });
    }

    this.pair(socket)
      .then((room: any) => {
        console.log('eeee', room.uuid);
        console.log('eeee', room.connectedUser);
        console.log('eeee', room.room);

        socket.emit(IResponseEvents.ClientPaired, {
          room: room.room,
          user: room.connectedUser,
          uuid: room.uuid,
        });
      })
      .catch((err) => console.error('ERR', err));
  }

  @SubscribeMessage('leave room')
  handleLeaveRoom(socket: Socket, data) {
    socket.leave(data.room);
    socket.to(data.room).emit(IResponseEvents.ClientDisconnected);
  }

  @SubscribeMessage('join room')
  handleJoinRoom(socket: Socket, data) {
    socket.join(data.room);
  }

  @SubscribeMessage('send message')
  async handleMessage(socket: Socket, data: ISendMessage) {
    const { room, message, user, receiver, repliedToId } = data;
    const m = await this.chatService.saveMessage({
      message,
      receiverId: receiver.id,
      userId: user.id,
      roomAdress: room,
      repliedToId,
      seen: false,
    });

    if (m) {
      const fcmUser = await this.prisma.fcmNotificationTokens.findFirst({
        where: {
          userId: receiver.id,
        },
      });

      if (fcmUser) {
        await firebase
          .messaging()
          .sendToDevice(fcmUser.fcmToken, {
            data: {
              entityType: 'message',
              entity: JSON.stringify({
                room: m.room,
                user: m.sender,
              }),
              link: 'com.derdevam://message-room/' + m.room.id,
            },
            notification: {
              title: user.username + ' kullanicisindan yeni bir mesajiniz var',
              body: message,
            },
          })
          .catch((err) => console.log(err));
      }

      this.pubSub.publish(MESSAGE_SENDED, {
        messageSended: m,
      });

      this.server.to(room).emit(IResponseEvents.MessageSended, {
        message: m,
      });
    }
  }

  // @SubscribeMessage('remove single message request')
  // async handleRemoveMessage(
  //   socket: uws.WebSocket,
  //   { messageId, room }: IRemoveMessageRequest,
  // ) {
  //   socket.publish(
  //     room,
  //     this.eventHandler(IResponseEvents.MessageRemoved, {
  //       messageId,
  //     }),
  //   );

  //   socket.send(
  //     this.eventHandler(IResponseEvents.MessageRemoved, {
  //       messageId,
  //     }),
  //   );

  //   await this.chatService.removeMessage(messageId);
  // }

  // @SubscribeMessage('typing')
  // handleTypingStatus(socket: uws.WebSocket, data) {
  //   if (data.typing) {
  //     socket.publish(
  //       data.room,
  //       this.eventHandler(IResponseEvents.Typing, {
  //         typing: true,
  //       }),
  //     );
  //   } else {
  //     socket.publish(data.room, this.eventHandler(IResponseEvents.DoneTyping));
  //   }
  // }

  @SubscribeMessage('leave queue')
  handleLeaveQueue(socket: Socket) {
    this.pool = this.pool.filter((id) => id.uuid !== socket.id);
  }

  @SubscribeMessage('call user')
  handleCallUser(socket: Socket, { offer, uuid }: ICallData) {
    this.server
      .to(uuid)
      .emit(IResponseEvents.CallMade, { offer, uuid: socket.id });
  }

  @SubscribeMessage('make answer')
  handleCallAnswer(socket: Socket, data: ICallAnswer) {
    this.server.to(data.uuid).emit(IResponseEvents.AnswerMade, {
      answer: data.answer,
      uuid: socket.id,
    });
  }

  @SubscribeMessage('add ice candidate')
  handleAddIceCandidate(socket: Socket, data: IAddIceCandidate) {
    this.server.to(data.uuid).emit(IResponseEvents.ReceivedIceCandidate, {
      candidate: data.candidate,
      uuid: socket.id,
    });
  }

  // @SubscribeMessage('retrieve call')
  // handleRetrieveCall(socket: uws.WebSocket, data: IRetrieveCall) {
  //   socket.publish(data.uuid, this.eventHandler(IResponseEvents.RetrieveCall));
  // }

  // @SubscribeMessage('microphone muted')
  // handleMicMuted(socket: uws.WebSocket, data: IMicMuted) {
  //   socket.publish(
  //     data.uuid,
  //     this.eventHandler(IResponseEvents.MicMuted, {
  //       isMuted: data.isMuted,
  //       uuid: socket.id,
  //     }),
  //   );
  // }

  @SubscribeMessage('ask for media permission')
  handleAskForMediaPermission(socket: Socket, data: IAskForMediaPermission) {
    console.log(data);
    this.server.to(data.uuid).emit(IResponseEvents.MediaPermissionAsked, {
      ...data,
      uuid: socket.id,
    });
  }

  @SubscribeMessage('allow media controls')
  handleMediaControl(socket: Socket, data: IAnswerMediaControl) {
    this.server.to(data.uuid).emit(IResponseEvents.MediaPermissionAnswered, {
      ...data,
      uuid: socket.id,
    });
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('connected');
    // client.subscribe(client.id);
  }
}
