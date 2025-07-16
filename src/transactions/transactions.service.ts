import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async getBalanceHistory(userId: number, date?: string) {
    const query = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.from_user', 'from_user')
      .leftJoinAndSelect('transaction.to_user', 'to_user')
      .where('(transaction.from_user_id = :userId OR transaction.to_user_id = :userId)', { userId });

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query.andWhere('transaction.created_at BETWEEN :startDate AND :endDate', { 
        startDate, 
        endDate 
      });
    }

    const transactions = await query.orderBy('transaction.created_at', 'DESC').getMany();

    return transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      balance_after: t.balance_after,
      created_at: t.created_at,
      from_user: t.from_user ? { 
        id: t.from_user.id, 
        full_name: t.from_user.full_name,
        rekening: t.from_user.rekening 
      } : null,
      to_user: t.to_user ? { 
        id: t.to_user.id, 
        full_name: t.to_user.full_name,
        rekening: t.to_user.rekening 
      } : null,
    }));
  }

  async getTransferHistory(userId?: number, startDate?: string, endDate?: string) {
    const query = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.from_user', 'from_user')
      .leftJoinAndSelect('transaction.to_user', 'to_user')
      .where('transaction.type = :type', { type: 'TRANSFER' });

    if (userId) {
      query.andWhere('(transaction.from_user_id = :userId OR transaction.to_user_id = :userId)', { userId });
    }

    // Add date filtering if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query.andWhere('transaction.created_at BETWEEN :start AND :end', { start, end });
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.andWhere('transaction.created_at >= :start', { start });
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.andWhere('transaction.created_at <= :end', { end });
    }

    const transfers = await query.orderBy('transaction.created_at', 'DESC').getMany();

    return transfers.map(t => ({
      id: t.id,
      amount: t.amount,
      from_user: { 
        id: t.from_user.id, 
        full_name: t.from_user.full_name,
        rekening: t.from_user.rekening 
      },
      to_user: { 
        id: t.to_user.id, 
        full_name: t.to_user.full_name,
        rekening: t.to_user.rekening 
      },
      created_at: t.created_at,
    }));
  }

  async getTopupHistory(userId?: number, startDate?: string, endDate?: string) {
    const query = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.to_user', 'to_user')
      .where('transaction.type = :type', { type: 'TOPUP' });

    if (userId) {
      query.andWhere('transaction.to_user_id = :userId', { userId });
    }

    // Add date filtering if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query.andWhere('transaction.created_at BETWEEN :start AND :end', { start, end });
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.andWhere('transaction.created_at >= :start', { start });
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.andWhere('transaction.created_at <= :end', { end });
    }

    const topups = await query.orderBy('transaction.created_at', 'DESC').getMany();

    return topups.map(t => ({
      id: t.id,
      amount: t.amount,
      user: { 
        id: t.to_user.id, 
        full_name: t.to_user.full_name,
        rekening: t.to_user.rekening 
      },
      created_at: t.created_at,
    }));
  }

  // New method to get transactions by date range
  async getTransactionsByDateRange(startDate: string, endDate: string, userId?: number) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const query = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.from_user', 'from_user')
      .leftJoinAndSelect('transaction.to_user', 'to_user')
      .where('transaction.created_at BETWEEN :start AND :end', { start, end });

    if (userId) {
      query.andWhere('(transaction.from_user_id = :userId OR transaction.to_user_id = :userId)', { userId });
    }

    const transactions = await query.orderBy('transaction.created_at', 'DESC').getMany();

    return transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      balance_after: t.balance_after,
      created_at: t.created_at,
      from_user: t.from_user ? { 
        id: t.from_user.id, 
        full_name: t.from_user.full_name,
        rekening: t.from_user.rekening 
      } : null,
      to_user: t.to_user ? { 
        id: t.to_user.id, 
        full_name: t.to_user.full_name,
        rekening: t.to_user.rekening 
      } : null,
    }));
  }
}