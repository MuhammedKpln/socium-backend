import { Field, ObjectType } from '@nestjs/graphql';
import { BaseStruct } from 'src/typeorm/BaseStruct';

@ObjectType()
export class Category extends BaseStruct {
  @Field()
  name: string;
  @Field({ nullable: true })
  description: string;
  @Field({ nullable: true })
  image: string;
}
