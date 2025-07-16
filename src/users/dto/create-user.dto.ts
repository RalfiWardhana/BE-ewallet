// src/users/dto/create-user.dto.ts
import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ 
    description: 'Bank account number (10-16 digits)', 
    example: '1234567890' 
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 16)
  @Matches(/^[0-9]+$/, { message: 'Rekening must contain only numbers' })
  rekening: string;
}