import { IsNotEmpty, Validate } from 'class-validator';
import { IS_UNICODE } from 'src/validators/unicode.validator';

export class EditProfileDto {
  @IsNotEmpty()
  @Validate(IS_UNICODE)
  emoji: string;

  @IsNotEmpty()
  bio: string;
}
