import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRequestDto {
  @IsNotEmpty()
  @IsNumber()
  toUserId: number;
}
