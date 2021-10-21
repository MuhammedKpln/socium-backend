import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
@ObjectType()
export class FcmNotificationUser extends BaseStruct {
  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  @Field((_returns) => User)
  user: User;

  @Column()
  @Field()
  fcmToken: string;
}
