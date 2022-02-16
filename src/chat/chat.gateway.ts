import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { RedisClient } from 'redis';
import { rangeNumber, shuffleArray } from 'src/helpers';
import { getRandomString } from 'src/helpers/randomString';
import { redisUrl } from 'src/main';
import { PrismaService } from 'src/prisma/prisma.service';
import * as uws from 'uWebSockets.js';
import { ChatService } from './chat.service';
import {
  IAddIceCandidate,
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

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection {
  private redis: RedisClient;
  private pool: IPool[] = [];

  constructor(
    private chatService: ChatService,
    private readonly prisma: PrismaService,
  ) {
    this.redis = new RedisClient({
      url: redisUrl,
      db: 3,
    });
  }

  private logger: Logger = new Logger();

  private eventHandler = (event: string, data?: any) => {
    return JSON.stringify({
      event,
      data,
    });
  };

  private pair(socket: uws.WebSocket) {
    return new Promise((resolve, reject) => {
      const random = rangeNumber(0, this.pool.length - 1);
      const user = this.pool.find((id) => id.uuid === socket.id);

      if (this.pool[random].uuid !== socket.id) {
        const connectedSocket = this.pool[random];
        const genRoom = getRandomString(10);

        try {
          console.log('#QWEQ', socket.id);
          socket.publish(
            connectedSocket.uuid,
            JSON.stringify({
              event: IResponseEvents.ClientPaired,
              data: {
                room: genRoom,
                user: user.user,
                uuid: socket.id,
              },
            }),
          );
          console.log('WEWE', connectedSocket.uuid);

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
  handleJoinQueue(socket: uws.WebSocket, data: IJoinQueue) {
    socket.subscribe(socket.id);
    const alreadyInQueue = this.pool.find((id) => id.uuid === socket.id);
    if (alreadyInQueue) {
      console.log('Already in queue');
      console.log(this.pool);
    } else {
      this.pool.push({
        uuid: socket.id,
        user: data.user,
      });
      socket.subscribe(socket.id);
    }

    this.pair(socket)
      .then((room: any) => {
        console.log('eeee', room.uuid);

        socket.send(
          JSON.stringify({
            event: IResponseEvents.ClientPaired,
            data: {
              room: room.room,
              user: room.connectedUser,
              uuid: room.uuid,
            },
          }),
        );
      })
      .catch((err) => console.error('ERR', err));
  }

  @SubscribeMessage('leave room')
  handleLeaveRoom(socket: uws.WebSocket, data) {
    socket.publish(data.room, 'client disconnected');
    socket.unsubscribe(data.room);
  }

  @SubscribeMessage('join room')
  handleJoinRoom(socket: uws.WebSocket, data) {
    socket.subscribe(data.room);
  }

  @SubscribeMessage('send message')
  async handleMessage(socket: uws.WebSocket, data: ISendMessage) {
    const { room, message, user, receiver } = data;

    const m = await this.chatService.saveMessage({
      message,
      receiverId: receiver.id,
      userId: user.id,
      roomAdress: room,
      seen: false,
    });

    if (m) {
      socket.publish(
        room,
        this.eventHandler(IResponseEvents.MessageSended, {
          message: m,
        }),
      );

      socket.send(
        this.eventHandler(IResponseEvents.MessageSended, {
          message: m,
        }),
      );
    }
  }

  @SubscribeMessage('remove single message request')
  async handleRemoveMessage(
    socket: uws.WebSocket,
    { messageId, room }: IRemoveMessageRequest,
  ) {
    socket.publish(
      room,
      this.eventHandler(IResponseEvents.MessageRemoved, {
        messageId,
      }),
    );

    socket.send(
      this.eventHandler(IResponseEvents.MessageRemoved, {
        messageId,
      }),
    );

    await this.chatService.removeMessage(messageId);
  }

  @SubscribeMessage('typing')
  handleTypingStatus(socket: uws.WebSocket, data) {
    if (data.typing) {
      socket.publish(
        data.room,
        this.eventHandler(IResponseEvents.Typing, {
          typing: true,
        }),
      );
    } else {
      socket.publish(data.room, this.eventHandler(IResponseEvents.DoneTyping));
    }
  }

  @SubscribeMessage('leave queue')
  handleLeaveQueue(socket: uws.WebSocket) {
    socket.unsubscribe(socket.id);
    this.pool = this.pool.filter((id) => id.uuid !== socket.id);
  }

  @SubscribeMessage('call user')
  handleCallUser(socket: uws.WebSocket, { offer, uuid }: ICallData) {
    socket.publish(
      uuid,
      this.eventHandler(IResponseEvents.CallMade, { offer, uuid: socket.id }),
    );
  }

  @SubscribeMessage('make answer')
  handleCallAnswer(socket: uws.WebSocket, data: ICallAnswer) {
    socket.publish(
      data.uuid,
      this.eventHandler(IResponseEvents.AnswerMade, {
        answer: data.answer,
        uuid: socket.id,
      }),
    );
  }

  @SubscribeMessage('add ice candidate')
  handleAddIceCandidate(socket: uws.WebSocket, data: IAddIceCandidate) {
    socket.publish(
      data.uuid,
      this.eventHandler(IResponseEvents.ReceivedIceCandidate, {
        candidate: data.candidate,
        uuid: socket.id,
      }),
    );
  }

  @SubscribeMessage('retrieve call')
  handleRetrieveCall(socket: uws.WebSocket, data: IRetrieveCall) {
    socket.publish(data.uuid, this.eventHandler(IResponseEvents.RetrieveCall));
  }

  @SubscribeMessage('microphone muted')
  handleMicMuted(socket: uws.WebSocket, data: IMicMuted) {
    socket.publish(
      data.uuid,
      this.eventHandler(IResponseEvents.MicMuted, {
        isMuted: data.isMuted,
        uuid: socket.id,
      }),
    );
  }

  handleConnection(client: uws.WebSocket, ...args: any[]) {
    console.log('connected', client);
    client.subscribe(client.id);
  }
}
