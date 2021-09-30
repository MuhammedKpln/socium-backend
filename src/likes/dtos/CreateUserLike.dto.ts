import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class CreateUserLikeDto {
  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  post?: number;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  comment?: number;
}
