import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateUserGoogleDto {
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(20)
  @Field()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @Field()
  email: string;

  @IsNotEmpty()
  @Field()
  idToken: string;
}
