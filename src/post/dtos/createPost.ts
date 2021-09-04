import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { OneOfNumber } from 'src/validators/oneof.validator';
import { PostType } from '../entities/post.entity';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @OneOfNumber([
    PostType.Content,
    PostType.Instagram,
    PostType.Twitter,
    PostType.Youtube,
  ])
  type:
    | PostType.Content
    | PostType.Instagram
    | PostType.Twitter
    | PostType.Youtube;
}
