import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      query.andWhere('DATE(transaction.created_at) = :date', { date });
    }

    const transactions = await query.orderBy('transaction.created_at', 'DESC').getMany();

    return transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      balance_after: t.balance_after,
      created_at: t.created_at,
      from_user: t.from_user ? { id: t.from_user.id, full_name: t.from_user.full_name } : null,
      to_user: t.to_user ? { id: t.to_user.id, full_name: t.to_user.full_name } : null,
    }));
  }

  async getTransferHistory(userId?: number) {
    const query = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.from_user', 'from_user')
      .leftJoinAndSelect('transaction.to_user', 'to_user')
      .where('transaction.type = :type', { type: 'TRANSFER' });

    if (userId) {
      query.andWhere('(transaction.from_user_id = :userId OR transaction.to_user_id = :userId)', { userId });
    }

    const transfers = await query.orderBy('transaction.created_at', 'DESC').getMany();

    return transfers.map(t => ({
      id: t.id,
      amount: t.amount,
      from_user: { id: t.from_user.id, full_name: t.from_user.full_name },
      to_user: { id: t.to_user.id, full_name: t.to_user.full_name },
      created_at: t.created_at,
    }));
  }

  async getTopupHistory(userId?: number) {
    const query = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.to_user', 'to_user')
      .where('transaction.type = :type', { type: 'TOPUP' });

    if (userId) {
      query.andWhere('transaction.to_user_id = :userId', { userId });
    }

    const topups = await query.orderBy('transaction.created_at', 'DESC').getMany();

    return topups.map(t => ({
      id: t.id,
      amount: t.amount,
      user: { id: t.to_user.id, full_name: t.to_user.full_name },
      created_at: t.created_at,
    }));
  }
}