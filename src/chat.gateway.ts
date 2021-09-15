import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { rangeNumber, removeItem, shuffleArray } from './helpers';

enum Role {
  'Talker' = 1,
  'Dinleyici' = 0,
}

interface IData {
  role: Role;
  id: string;
}
interface ICallOffer {
  offer: string;
  to: string;
}
interface ICallAnswer {
  answer: string;
  to: string;
}

interface ITypingData {
  typing: boolean;
  username: string;
}

interface IRoomMessage {
  roomName: string;
  message?: string;
  firstJoined: boolean;
}

@WebSocketGateway({ cors: true, namespace: 'PairingScreen' })
export class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection {
  private activeSockets: {
    room: string;
    users: string[];
  }[] = [];
  private tellersPool: string[] = [];

  private logger: Logger = new Logger();

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinQueue')
  joinQueue(client: Socket, data: IData) {
    if (data.role === 1) {
      // Talker
      this.tellersPool.push(client.id);

      client.emit('joinedQueue', this.tellersPool);
    } else {
      // Listener
      const shuffledTellers = shuffleArray(this.tellersPool);
      const randomNumber = rangeNumber(0, this.tellersPool.length);
      const pairedClient = shuffledTellers[randomNumber];
      const randomRoomName =
        Math.floor(Math.random() * 1000) + pairedClient + client.id;

      if (pairedClient === client.id) {
        this.tellersPool = removeItem(client.id, this.tellersPool);

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

      this.tellersPool = removeItem(pairedClient, this.tellersPool);
    }
  }

  @SubscribeMessage('room')
  handleRoom(client: Socket, data: IRoomMessage) {
    client.join(data.roomName);

    console.log(data);
    if (data.message) {
      this.server.to(data.roomName).emit('message', {
        message: data.message,
        clientId: client.id,
      });
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

  handleConnection(client: Socket) {
    this.logger.log('user connected');
  }

  handleDisconnect(client: Socket) {
    this.tellersPool = this.tellersPool.filter(
      (teller) => teller === client.id,
    );

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
    this.logger.log('user disconnected');
  }
}
