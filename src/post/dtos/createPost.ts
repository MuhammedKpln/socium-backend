import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, MinLength, Validate } from 'class-validator';
import { OneOf } from 'src/validators/oneof.validator';
import { PostType } from '../entities/post.entity';

@InputType()
export class CreatePostDto {
  @IsNotEmpty()
  @Field()
  @MinLength(15)
  title: string;

  @IsNotEmpty()
  @Field()
  @MinLength(15)
  content: string;

  @IsNumber()
  @IsNotEmpty()
  @Field()
  categoryId: number;

  @IsNotEmpty()
  @Validate(OneOf, [
    PostType.Content,
    PostType.Instagram,
    PostType.Twitter,
    PostType.Youtube,
    PostType.Blog,
  ])
  @Field()
  type: PostType.Content &
    PostType.Instagram &
    PostType.Twitter &
    PostType.Youtube &
    PostType.Blog;
}
