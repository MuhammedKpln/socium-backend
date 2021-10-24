import { Field, InputType } from '@nestjs/graphql';
import { IsDate, IsNotEmpty, Validate } from 'class-validator';
import { Gender } from 'src/auth/entities/user.entity';
import { OneOf } from 'src/validators/oneof.validator';

@InputType()
export class UpdateUserAgeAndGenderDto {
  @IsDate()
  @IsNotEmpty()
  @Field()
  birthday: Date;

  @Validate(OneOf, [Gender.Male, Gender.Female])
  @Field()
  gender: Gender;
}
