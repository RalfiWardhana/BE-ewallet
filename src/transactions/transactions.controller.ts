import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('balance-history')
  @ApiOperation({ summary: 'Get user balance history by date' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'date', required: false })
  getBalanceHistory(@Query('userId') userId: string, @Query('date') date?: string) {
    return this.transactionsService.getBalanceHistory(+userId, date);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Get transfer history' })
  @ApiQuery({ name: 'userId', required: false })
  getTransferHistory(@Query('userId') userId?: string) {
    return this.transactionsService.getTransferHistory(userId ? +userId : undefined);
  }

  @Get('topups')
  @ApiOperation({ summary: 'Get topup history' })
  @ApiQuery({ name: 'userId', required: false })
  getTopupHistory(@Query('userId') userId?: string) {
    return this.transactionsService.getTopupHistory(userId ? +userId : undefined);
  }
}