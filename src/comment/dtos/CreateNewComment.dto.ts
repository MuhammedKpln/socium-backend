import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreteNewCommentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(100)
  content: string;
}
