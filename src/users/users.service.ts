import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async topup(userId: number, amount: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.balance = Number(user.balance) + amount;
      await queryRunner.manager.save(user);

      const transaction = queryRunner.manager.create(Transaction, {
        type: 'TOPUP',
        amount: amount,
        to_user: user,
        balance_after: user.balance,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return { message: 'Topup successful', balance: user.balance };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async transfer(fromUserId: number, toUserId: number, amount: number) {
    if (fromUserId === toUserId) {
      throw new BadRequestException('Cannot transfer to same user');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fromUser = await queryRunner.manager.findOne(User, { where: { id: fromUserId } });
      const toUser = await queryRunner.manager.findOne(User, { where: { id: toUserId } });

      if (!fromUser || !toUser) {
        throw new NotFoundException('User not found');
      }

      if (Number(fromUser.balance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      fromUser.balance = Number(fromUser.balance) - amount;
      toUser.balance = Number(toUser.balance) + amount;

      await queryRunner.manager.save(fromUser);
      await queryRunner.manager.save(toUser);

      const transaction = queryRunner.manager.create(Transaction, {
        type: 'TRANSFER',
        amount: amount,
        from_user: fromUser,
        to_user: toUser,
        balance_after: fromUser.balance,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return { message: 'Transfer successful', balance: fromUser.balance };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
    return { message: 'User deleted successfully' };
  }
}