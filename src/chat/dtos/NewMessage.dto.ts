import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class NewMessageDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsNumber()
  receiverId: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  roomAdress: string;
}
