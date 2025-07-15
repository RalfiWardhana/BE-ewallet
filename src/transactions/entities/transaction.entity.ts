import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['TOPUP', 'TRANSFER'] })
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => User, user => user.sent_transactions, { nullable: true })
  @JoinColumn({ name: 'from_user_id' })
  from_user: User;

  @ManyToOne(() => User, user => user.received_transactions)
  @JoinColumn({ name: 'to_user_id' })
  to_user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance_after: number;

  @CreateDateColumn()
  created_at: Date;
}