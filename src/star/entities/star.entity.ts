import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
@ObjectType()
export class Star extends BaseStruct {
  @Column({ type: 'numeric', default: 0 })
  @Field()
  starCount: number;

  @OneToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  @Field((_returns) => User)
  user: User;
}
