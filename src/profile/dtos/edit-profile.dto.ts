import { Field, InputType } from '@nestjs/graphql';
import {
  IsBase64,
  IsDate,
  IsJSON,
  IsMimeType,
  IsOptional,
} from 'class-validator';

@InputType()
export class EditProfileDto {
  @IsOptional()
  @IsBase64()
  @Field({ nullable: true })
  avatar: string;

  @IsOptional()
  @Field({ nullable: true })
  bio: string;

  @IsOptional()
  @Field({ nullable: true })
  username: string;

  @IsOptional()
  @Field({ nullable: true })
  blockIncomingCalls: boolean;

  @IsOptional()
  @IsDate()
  @Field({ nullable: true })
  birthday: Date;

  @IsOptional()
  @IsJSON()
  @Field({ nullable: true })
  avatarMeta: string;
}
