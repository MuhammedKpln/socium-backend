import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class MessageRequest extends BaseStruct {
  @ManyToOne(() => User, { eager: true })
  requestFrom: User;

  @ManyToOne(() => User, { eager: true })
  requestTo: User;

  @Column({ type: 'boolean', default: false })
  request: boolean;
}
