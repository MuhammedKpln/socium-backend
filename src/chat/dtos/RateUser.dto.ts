import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, Validate } from 'class-validator';
import { OneOf } from 'src/validators/oneof.validator';

@InputType()
export class RateUserDto {
  @IsNotEmpty()
  @IsNumber()
  @Validate(OneOf, [1, 2, 3, 4, 5])
  @Field()
  rating: number;

  @IsNotEmpty()
  @IsNumber()
  @Field()
  userId: number;
}
