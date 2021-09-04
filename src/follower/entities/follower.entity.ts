import { User } from 'src/auth/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Follower {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => User)
  user: User;

  @ManyToOne((type) => User)
  actor: User;

  @CreateDateColumn()
  created_at: Date;
}
