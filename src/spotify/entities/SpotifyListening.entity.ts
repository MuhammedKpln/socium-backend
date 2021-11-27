import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { BaseStruct } from 'src/typeorm/BaseStruct';

@ObjectType()
export class SpotifyCurrentlyListening extends BaseStruct {
  @Field()
  songName: string;

  @Field()
  artistName: string;

  @Field()
  image: string;

  @Field((_returns) => User)
  user: User;
}
