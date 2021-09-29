import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Entity, ManyToOne } from 'typeorm';

@Entity()
@ObjectType()
export class Follower extends BaseStruct {
  @ManyToOne((type) => User)
  @Field((_returns) => User)
  user: User;

  @ManyToOne((type) => User)
  @Field((_returns) => User)
  actor: User;
}
