import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Room } from './room.entity';

@ObjectType()
export class Messages extends BaseStruct {
  @Field((_returns) => Room)
  room: Room;

  @Field((_returns) => User)
  sender: User;

  @Field((_returns) => User)
  receiver: User;

  @Field((_) => Messages, { nullable: true })
  repliedToMessage?: Messages;

  @Field()
  message: string;

  @Field()
  seen: boolean;
}
