import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class EditNotificationSettingsDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  follower: boolean;
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  messageRequest: boolean;
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  comments: boolean;
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  disableAll: boolean;
}
