// src/users/users.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
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
    // Check if rekening already exists
    const existingUser = await this.usersRepository.findOne({ 
      where: { rekening: createUserDto.rekening } 
    });
    
    if (existingUser) {
      throw new ConflictException('Rekening already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll() {
    return await this.usersRepository.find({
      select: ['id', 'full_name', 'rekening', 'balance', 'created_at'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByRekening(rekening: string) {
    const user = await this.usersRepository.findOne({ where: { rekening } });
    if (!user) {
      throw new NotFoundException('User with this rekening not found');
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
      return { 
        message: 'Topup successful', 
        balance: user.balance,
        rekening: user.rekening 
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async transfer(fromUserId: number, toUserIdOrRekening: number | string, amount: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fromUser = await queryRunner.manager.findOne(User, { where: { id: fromUserId } });
      if (!fromUser) {
        throw new NotFoundException('Sender user not found');
      }

      let toUser: User | null;
      if (typeof toUserIdOrRekening === 'number') {
        toUser = await queryRunner.manager.findOne(User, { where: { id: toUserIdOrRekening } });
      } else {
        toUser = await queryRunner.manager.findOne(User, { where: { rekening: toUserIdOrRekening } });
      }

      if (!toUser) {
        throw new NotFoundException('Recipient user not found');
      }

      if (fromUser.id === toUser.id) {
        throw new BadRequestException('Cannot transfer to same user');
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
      return { 
        message: 'Transfer successful', 
        balance: fromUser.balance,
        from_rekening: fromUser.rekening,
        to_rekening: toUser.rekening
      };
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