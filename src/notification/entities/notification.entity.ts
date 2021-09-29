import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { NotificationType } from './notification.type';

@Entity()
@ObjectType()
export class Notification extends BaseStruct {
  @ManyToOne(() => User, (user) => user.id, { eager: true })
  @Field((_returns) => User)
  user: User;

  @ManyToOne(() => User, (user) => user.id, { eager: true })
  @Field((_returns) => User)
  actor: User;

  @Column()
  @Field()
  notificationType: NotificationType;

  @Column({ type: 'boolean', default: false })
  @Field()
  readed: boolean;
}
