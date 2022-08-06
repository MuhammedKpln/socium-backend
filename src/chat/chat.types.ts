import { User } from 'src/auth/entities/user.entity';

export enum Role {
  'Talker' = 1,
  'Dinleyici' = 0,
}

interface IUUID {
  uuid: string;
}

export interface IJoinQueue {
  user: User;
}
export interface ICallOffer {
  offer: string;
  to: string;
}
export interface ICallAnswer {
  answer: string;
  uuid: string;
}

export interface ITypingData {
  typing: boolean;
  roomAdress: string;
}

export interface IRoomMessage {
  roomName: string;
  firstJoined: true;
  user?: User;
  pairedClientId?: string;
}

export interface ISendMessage {
  room: string;
  message?: string;
  user: User;
  receiver: User;
  repliedToId?: number;
}

export interface ISaveMessageProps {
  roomAdress: string;
  message: string;
  userId: number;
  receiverId: number;
  seen: boolean;
  repliedToId?: number;
}
export interface ICheckForRoomProps {
  roomAdress?: string;
  roomId?: number;
}

export interface IRemoveMessageRequest {
  messageId: number;
  room: string;
}

export interface IPool {
  uuid: string;
  user: User;
}

export interface ICallData {
  offer: RTCSessionDescription;
  uuid: string;
}

export enum IResponseEvents {
  ClientPaired = 'CLIENT_PAIRED',
  MessageSended = 'MESSAGE_RECEIVED',
  Typing = 'USER_IS_TYPING',
  DoneTyping = 'USER_IS_DONE_TYPING',
  MessageRemoved = 'MESSAGE_REMOVED',
  CallMade = 'CALL_MADE',
  AnswerMade = 'ANSWER_MADE',
  ReceivedIceCandidate = 'RECEIVED_ICE_CANDIDATE',
  RetrieveCall = 'CALL_RETRIEVED',
  MicMuted = 'MIC_MUTED',
  MediaPermissionAsked = 'MEDIA_PERMISSION_ASKED',
  MediaPermissionAnswered = 'MEDIA_PERMISSION_ANSWERED',
  ClientDisconnected = 'CLIENT_DISCONNECTED',
}

export interface IAddIceCandidate {
  uuid: string;
  candidate: RTCIceCandidateType;
}

export interface IRetrieveCall {
  uuid: string;
}

export interface IMicMuted extends IUUID {
  isMuted: boolean;
}

export interface IAskForMediaPermission extends IUUID {
  video?: boolean;
  audio?: boolean;
}

export interface IAnswerMediaControl extends IUUID {
  video?: boolean;
  audio?: boolean;
}
