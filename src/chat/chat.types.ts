import { User } from 'src/auth/entities/user.entity';

export enum Role {
  'Talker' = 1,
  'Dinleyici' = 0,
}

export interface IData {
  role: Role;
}
export interface ICallOffer {
  offer: string;
  to: string;
}
export interface ICallAnswer {
  answer: string;
  to: string;
}

export interface ITypingData {
  typing: boolean;
  username: string;
}

export interface IRoomMessage {
  roomName: string;
  firstJoined: true;
  user?: User;
  pairedClientId?: string;
}

export interface ISendMessage {
  roomName: string;
  message?: string;
  user: User;
  receiverId: number;
  userId: number;
}

export interface ISaveMessageProps {
  roomAdress: string;
  message: string;
  userId: number;
  receiverId: number;
  seen: boolean;
}
export interface ICheckForRoomProps {
  roomAdress: string;
}
