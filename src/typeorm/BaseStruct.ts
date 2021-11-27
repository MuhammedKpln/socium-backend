import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BaseStruct {
  @Field()
  id: number;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
