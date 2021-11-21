import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { OneOf } from 'src/validators/oneof.validator';
import { PostType } from '../entities/post.entity';

@InputType()
export class CreatePostDto {
  @IsOptional()
  @Field({ nullable: true })
  title: string;

  @IsNotEmpty()
  @Field()
  content: string;

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
