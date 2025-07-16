import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('balance-history')
  @ApiOperation({ summary: 'Get user balance history by date' })
  @ApiQuery({ name: 'userId', required: true, type: Number })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Date in YYYY-MM-DD format' })
  getBalanceHistory(@Query('userId') userId: string, @Query('date') date?: string) {
    return this.transactionsService.getBalanceHistory(+userId, date);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Get transfer history with optional date filtering' })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date in YYYY-MM-DD format' })
  getTransferHistory(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.transactionsService.getTransferHistory(
      userId ? +userId : undefined,
      startDate,
      endDate
    );
  }

  @Get('topups')
  @ApiOperation({ summary: 'Get topup history with optional date filtering' })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date in YYYY-MM-DD format' })
  getTopupHistory(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.transactionsService.getTopupHistory(
      userId ? +userId : undefined,
      startDate,
      endDate
    );
  }

  @Get('by-date-range')
  @ApiOperation({ summary: 'Get all transactions within a date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'Start date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'End date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  getTransactionsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('userId') userId?: string
  ) {
    return this.transactionsService.getTransactionsByDateRange(
      startDate,
      endDate,
      userId ? +userId : undefined
    );
  }
}