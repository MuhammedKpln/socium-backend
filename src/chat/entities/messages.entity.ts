import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Room } from './room.entity';

@Entity()
export class Messages extends BaseStruct {
  @ManyToOne(() => Room, { eager: true })
  room: Room;

  @ManyToOne(() => User, { eager: true })
  sender: User;

  @ManyToOne(() => User, { eager: true })
  receiver: User;

  @Column()
  message: string;

  @Column({ type: 'boolean', default: false })
  seen: boolean;
}
