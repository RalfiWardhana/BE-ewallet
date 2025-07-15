import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty()
  @IsNumber()
  to_user_id: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;
}