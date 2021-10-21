import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
@ObjectType()
export class MessageRequest extends BaseStruct {
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @Field((returns) => User)
  requestFrom: User;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @Field((returns) => User)
  requestTo: User;

  @Column({ type: 'boolean', default: false })
  @Field()
  request: boolean;
}
