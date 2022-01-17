import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, MinLength, Validate } from 'class-validator';
import { OneOf } from 'src/validators/oneof.validator';
import { PostType } from '../entities/post.entity';

@InputType()
export class CreatePostDto {
  @Field({ nullable: true })
  additional: string;

  @Field()
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
