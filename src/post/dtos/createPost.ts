import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, Validate } from 'class-validator';
import { OneOf } from 'src/validators/oneof.validator';
import { PostType } from '../entities/post.entity';

@InputType()
export class CreatePostDto {
  @IsNotEmpty()
  @Field()
  content: string;

  @IsNotEmpty()
  @Validate(OneOf, [
    PostType.Content,
    PostType.Instagram,
    PostType.Twitter,
    PostType.Youtube,
  ])
  @Field()
  type:
    | PostType.Content
    | PostType.Instagram
    | PostType.Twitter
    | PostType.Youtube;
}
