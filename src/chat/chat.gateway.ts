import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { redisClient } from 'src/main';
import { rangeNumber, removeItem, shuffleArray } from '../helpers';
import { ChatService } from './chat.service';
import {
  ICallAnswer,
  ICallOffer,
  IData,
  IRoomMessage,
  ISendMessage,
  ITypingData,
} from './chat.types';

@WebSocketGateway({
  cors: true,
  namespace: 'PairingScreen',
})
export class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection {
  constructor(private chatService: ChatService) {}

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
  async handleRoom(client: Socket, data: IRoomMessage) {
    client.join(data.roomName);

    console.log(client.id, data.pairedClientId);
    if (data.pairedClientId) {
      this.server.to(data.pairedClientId).emit('user', data.user);
    } else {
      client.emit('user', data.user);
    }
  }

  @SubscribeMessage('send message')
  async handleNewMessage(client: Socket, data: ISendMessage) {
    const { message, roomName, user, receiverId, userId } = data;

    if (message) {
      const splittedMessage = message.split(' ');
      const abuseDetected = await this.abuseDetector(splittedMessage);

      if (!abuseDetected) {
        this.server.to(data.roomName).emit('message', {
          message: message,
          clientId: client.id,
        });

        const seen = false;

        await this.chatService.saveMessage({
          message,
          receiverId,
          userId,
          roomAdress: roomName,
          seen,
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
      username: data.username,
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

      const found = await redisClient.get(message.toLowerCase());
      if (found) {
        abuseDetectedMessages.push(found);
      }
    }

    if (abuseDetectedMessages.length > 0) {
      return true;
    }

    return false;
  }

  handleConnection(client: Socket) {
    this.logger.log('user connected');
  }

  handleDisconnect(client: Socket) {
    this.tellersPool = this.tellersPool.filter(
      (teller) => teller === client.id,
    );
    this.pool = this.pool.filter((teller) => teller === client.id);

    const socket = this.activeSockets.find((socket) => {
      if (socket.room.includes(client.id)) {
        return socket;
      }
    });

    if (socket) {
      this.server.to(socket.room).emit('client disconnected');
    }

    this.activeSockets = this.activeSockets.filter((socket) =>
      socket.room.includes(client.id),
    );

    this.users = this.users.filter((user) => user.clientId !== client.id);

    console.log(this.users);

    this.logger.log('user disconnected');
  }
}
