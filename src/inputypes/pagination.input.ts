import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

@InputType()
export class PaginationParams {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Field()
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Field()
  limit?: number;
}
