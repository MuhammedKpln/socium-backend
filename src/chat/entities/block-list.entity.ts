import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';

export class Block extends BaseStruct {
  user: User;

  actor: User;
}
