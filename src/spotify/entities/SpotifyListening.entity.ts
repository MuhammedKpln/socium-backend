import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@ObjectType()
@Entity()
export class SpotifyCurrentlyListening extends BaseStruct {
  @Column()
  @Field()
  songName: string;

  @Column()
  @Field()
  artistName: string;

  @Column()
  @Field()
  image: string;

  @Field((_returns) => User)
  @OneToOne((_) => User, { eager: true })
  @JoinColumn()
  user: User;
}
