import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Attachments {
  @Field((_returns) => [String])
  media_keys: string[];
}

@ObjectType()
export class Datum {
  @Field()
  text: string;

  @Field()
  author_id: string;

  @Field()
  id: string;

  @Field((_returns) => Attachments)
  attachments: Attachments;
}

@ObjectType()
export class Medium {
  @Field()
  media_key: string;

  @Field()
  type: string;

  @Field()
  url: string;
}

@ObjectType()
export class TwitterUser {
  @Field()
  profile_image_url: string;

  @Field()
  id: string;

  @Field()
  created_at: Date;

  @Field()
  username: string;

  @Field()
  name: string;
}

@ObjectType()
export class Includes {
  @Field((_returns) => [TwitterUser])
  users: TwitterUser[];

  @Field((_returns) => [Medium])
  media: Medium[];
}

@ObjectType()
export class TwitterPost {
  @Field((_returns) => [Datum])
  data: Datum[];

  @Field((_returns) => Includes)
  includes: Includes;
}
