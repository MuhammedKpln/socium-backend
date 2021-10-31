import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateCurrentTrackDto {
  @Field()
  @IsNotEmpty()
  songName: string;

  @Field()
  @IsNotEmpty()
  artistName: string;

  @Field()
  @IsNotEmpty()
  imageUrl: string;
}
