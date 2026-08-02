// 用户徽章实体（用户 × 徽章，唯一约束防重复发放）
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('user_badges')
@Unique(['userId', 'badgeId'])
export class UserBadge {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: number;

  /** 徽章 ID（对应徽章常量表中的标识） */
  @Column()
  badgeId: string;

  @CreateDateColumn()
  createdAt: Date;
}
