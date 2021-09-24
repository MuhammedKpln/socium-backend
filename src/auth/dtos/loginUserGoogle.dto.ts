import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserGoogleDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  idToken: string;
}
