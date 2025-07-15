import { Controller, Get, Post, Body, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { TopupDto } from './dto/topup.dto';
import { TransferDto } from './dto/transfer.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post(':id/topup')
  @ApiOperation({ summary: 'Top up user balance' })
  topup(@Param('id') id: string, @Body() topupDto: TopupDto) {
    return this.usersService.topup(+id, topupDto.amount);
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer balance to another user' })
  transfer(@Param('id') id: string, @Body() transferDto: TransferDto) {
    return this.usersService.transfer(+id, transferDto.to_user_id, transferDto.amount);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}