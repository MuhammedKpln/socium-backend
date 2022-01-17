import { Field, InputType } from '@nestjs/graphql';
import { IsDate, IsOptional, Validate } from 'class-validator';
import { OneOf } from 'src/validators/oneof.validator';

const avatars = [
  'avatar1',
  'avatar2',
  'avatar3',
  'avatar4',
  'avatar5',
  'avatar6',
  'avatar7',
  'avatar8',
  'avatar9',
  'avatar10',
  'avatar11',
  'avatar12',
  'avatar13',
  'avatar14',
  'avatar15',
  'avatar16',
  'avatar17',
  'avatar18',
  'avatar19',
  'avatar20',
  'avatar21',
  'avatar22',
  'avatar23',
  'avatar24',
  'avatar25',
  'avatar26',
  'avatar27',
  'avatar28',
  'avatar29',
  'avatar30',
  'avatar31',
  'avatar32',
  'avatar33',
  'avatar34',
  'avatar35',
  'avatar36',
  'avatar37',
  'avatar38',
  'avatar39',
  'avatar40',
  'avatar41',
  'avatar42',
  'avatar43',
  'avatar44',
  'avatar45',
  'avatar46',
  'avatar47',
  'avatar48',
  'avatar49',
  'avatar50',
  'avatar51',
];

@InputType()
export class EditProfileDto {
  @IsOptional()
  @Validate(OneOf, avatars)
  @Field({ nullable: true })
  avatar: string;

  @IsOptional()
  @Field({ nullable: true })
  bio: string;

  @IsOptional()
  @Field({ nullable: true })
  username: string;

  @IsOptional()
  @Field({ nullable: true })
  blockIncomingCalls: boolean;

  @IsOptional()
  @IsDate()
  @Field({ nullable: true })
  birthday: Date;
}
