import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Entity, OneToOne } from 'typeorm';

@Entity()
export class Block extends BaseStruct {
  @OneToOne((_type) => User)
  user: User;

  @OneToOne((_type) => User)
  actor: User;
}
