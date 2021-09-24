import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Star extends BaseStruct {
  @Column({ type: 'numeric', default: 0 })
  starCount: number;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;
}
