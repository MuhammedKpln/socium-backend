import { Field, InputType } from '@nestjs/graphql';
import { IsBase64, IsMimeType, IsOptional } from 'class-validator';

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
}
