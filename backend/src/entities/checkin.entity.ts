// 打卡实体（每天一条，唯一约束防重复打卡）
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('checkins')
@Unique(['userId', 'date'])
export class Checkin {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: number;

  /** 打卡日期（YYYY-MM-DD 字符串） */
  @Column()
  date: string;

  @CreateDateColumn()
  createdAt: Date;
}
