import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreteNewCommentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(100)
  @Field()
  content: string;
}
