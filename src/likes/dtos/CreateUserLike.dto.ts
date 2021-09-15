import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateUserLikeDto {
  @IsNotEmpty() liked: boolean;

  @IsOptional()
  @IsNumber()
  post?: number;

  @IsOptional()
  @IsNumber()
  comment?: number;
}
