import { IsNotEmpty, IsNumber } from 'class-validator';

export class FollowUserDto {
  @IsNotEmpty()
  @IsNumber()
  actorId: number;
}
