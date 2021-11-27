import { Field, ObjectType } from '@nestjs/graphql';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Messages } from './messages.entity';

@ObjectType()
export class Room extends BaseStruct {
  @Field()
  roomAdress: string;

  @Field()
  expireDate: Date;

  @Field((_returns) => [Messages])
  messages: Messages;
}
