import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TopupDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;
}