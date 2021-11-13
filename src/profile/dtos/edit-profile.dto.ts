import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

export enum EmojiPack {
  'Neutralface' = 0,
  'Palmsuptogether' = 1,
  'Partyingface' = 2,
  'Pensiveface' = 3,
  'Poutingface' = 4,
  'Scrunchedface' = 5,
  'Tiredface' = 5,
  'Shushingface' = 6,
  'Smilingfacewithhearts' = 7,
  'Smilingfacewithsunglasses' = 8,
  'Smilingface' = 9,
}

@InputType()
export class EditProfileDto {
  @IsOptional()
  @Field({ nullable: true })
  emoji: string;

  @IsOptional()
  @Field({ nullable: true })
  bio: string;

  @IsOptional()
  @Field({ nullable: true })
  username: string;

  @IsOptional()
  @Field({ nullable: true })
  blockIncomingCalls: boolean;
}
