import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString, Validate } from 'class-validator';
import { OneOf } from 'src/validators/oneof.validator';
import { PostType } from '../entities/post.entity';

export const ALLOWED_COLORS: string[] = [
  '#6690FF',
  '#69C62B',
  '#7612AA',
  '#FFAA00',
  '#FF4E3A',
];

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

  @IsString()
  @IsNotEmpty()
  @Validate(OneOf, ALLOWED_COLORS)
  @Field()
  color: string;
}
