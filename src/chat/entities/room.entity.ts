import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Column, Entity, ManyToMany, UpdateDateColumn } from 'typeorm';
import { Messages } from './messages.entity';

@Entity()
export class Room extends BaseStruct {
  @Column()
  roomAdress: string;

  @UpdateDateColumn()
  expireDate: Date;

  @ManyToMany(() => Messages, (messages) => messages.room)
  messages: Messages;
}
