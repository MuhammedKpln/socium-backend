import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Room } from './room.entity';

@Entity()
@ObjectType()
export class Messages extends BaseStruct {
  @ManyToOne(() => Room, { eager: true })
  @Field((_returns) => Room)
  room: Room;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @Field((_returns) => User)
  sender: User;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @Field((_returns) => User)
  receiver: User;

  @Column()
  @Field()
  message: string;

  @Column({ type: 'boolean', default: false })
  @Field()
  seen: boolean;
}
