import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';

@ObjectType()
export class Star extends BaseStruct {
  @Field()
  starCount: number;

  @Field((_returns) => User)
  user: User;
}
