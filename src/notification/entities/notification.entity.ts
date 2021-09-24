import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { NotificationType } from './notification.type';

@Entity()
export class Notification extends BaseStruct {
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => User, (user) => user.id)
  actor: User;

  @Column()
  notificationType: NotificationType;

  @Column({ type: 'boolean', default: false })
  readed: boolean;
}
