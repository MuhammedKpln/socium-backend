import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';

@ObjectType()
export class FcmNotificationUser extends BaseStruct {
  @Field((_returns) => User)
  user: User;

  @Field()
  fcmToken: string;
}
