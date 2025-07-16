import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferDto {
  @ApiPropertyOptional({ description: 'Target user ID (use either this or to_rekening)' })
  @IsNumber()
  @IsOptional()
  to_user_id?: number;

  @ApiPropertyOptional({ description: 'Target user rekening (use either this or to_user_id)' })
  @IsString()
  @IsOptional()
  to_rekening?: string;

  @ApiProperty({ description: 'Amount to transfer' })
  @IsNumber()
  @IsPositive()
  amount: number;
}