import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Client } from 'socket.io/dist/client';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/user.entity';
import { redisClient } from 'src/main';
import { rangeNumber, removeItem, shuffleArray } from '../helpers';
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
  constructor(
    private chatService: ChatService,
    private authService: AuthService,
  ) {}

  private activeSockets: {
    room: string;
    users: string[];
  }[] = [];

  private users: {
    clientId: string;
    user: User;
  }[] = [];

  private pool: string[] = [];
  private tellersPool: string[] = [];

  private logger: Logger = new Logger();

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinQueue')
  async joinQueue(client: Socket, data: IData) {
    // if (data.role === 1) {
    //   // Talker
    //   this.tellersPool.push(client.id);
    //   this.pool.push(client.id);

    //   client.emit('joinedQueue', this.tellersPool);
    // } else {
    // Listener
    this.tellersPool.push(client.id);
    this.pool.push(client.id);

    const shuffledTellers = shuffleArray(this.pool).filter(
      (id) => id !== client.id,
    );
    const randomNumber = rangeNumber(0, this.pool.length - 1);
    const pairedClient = shuffledTellers[randomNumber];
    const randomRoomName =
      Math.floor(Math.random() * 1000) + pairedClient + client.id;

    if (pairedClient === client.id) {
      this.pool = removeItem(client.id, this.pool);

      return false;
    }

    if (!pairedClient) {
      return false;
    }

    this.activeSockets.push({
      room: randomRoomName,
      users: [pairedClient, client.id],
    });

    client.emit('clientPaired', {
      clientId: pairedClient,
      roomName: randomRoomName,
    });

    this.server.to(pairedClient).emit('clientPaired', {
      clientId: client.id,
      roomName: randomRoomName,
    });

    this.tellersPool = removeItem(pairedClient, this.pool);
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
    this.pool = this.pool.filter((id) => id !== client.id);
  }

  @SubscribeMessage('leave room')
  async leaveRoom(client: Socket, data: IRoomMessage) {
    this.server.to(data.roomName).emit('client disconnected');

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

    this.users.push({
      clientId: client.id,
      user: data.user,
    });
  }
  @SubscribeMessage('user is already connected')
  userIsAlreadyConnected(client: Socket, data) {
    const isAvailable = this.users.filter(
      (user) => user.user.id === data.userId,
    );

    if (isAvailable.length > 0) {
      return client.emit('user is online', {
        status: true,
      });
    }

    return client.emit('user is online', {
      status: false,
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
    this.onlineUsers(client);
    // const verified = await this.authService.validateJwt(
    //   client.handshake.headers.authorization,
    // );

    // !verified && client.disconnect();
  }

  async handleDisconnect(client: Socket) {
    const sockets = await this.server.fetchSockets();

    this.tellersPool = this.tellersPool.filter(
      (teller) => teller === client.id,
    );
    this.pool = this.pool.filter((teller) => teller === client.id);

    this.activeSockets = this.activeSockets.filter((socket) =>
      socket.room.includes(client.id),
    );

    this.users = this.users.filter((user) => user.clientId !== client.id);
    this.server.emit('online users', {
      count: sockets.length,
    });
    this.logger.log('user disconnected');
  }
}
