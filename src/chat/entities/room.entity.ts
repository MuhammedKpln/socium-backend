import { Field, ObjectType } from '@nestjs/graphql';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Column, Entity, ManyToMany, UpdateDateColumn } from 'typeorm';
import { Messages } from './messages.entity';

@Entity()
@ObjectType()
export class Room extends BaseStruct {
  @Column()
  @Field()
  roomAdress: string;

  @UpdateDateColumn()
  @Field()
  expireDate: Date;

  @ManyToMany(() => Messages, (messages) => messages.room, {
    onDelete: 'CASCADE',
  })
  @Field((_returns) => [Messages])
  messages: Messages;
}
