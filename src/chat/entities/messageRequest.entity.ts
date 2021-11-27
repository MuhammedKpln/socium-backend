import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';

@ObjectType()
export class MessageRequest extends BaseStruct {
  @Field((returns) => User)
  requestFrom: User;

  @Field((returns) => User)
  requestTo: User;

  @Field()
  request: boolean;
}
