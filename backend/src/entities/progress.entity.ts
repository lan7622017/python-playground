// 关卡进度实体（用户 × 关卡，唯一约束防并发重复通关）
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('progress')
@Unique(['userId', 'levelId'])
export class LevelProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: number;

  @Index()
  @Column()
  levelId: number;

  /** 是否已完成（已通关） */
  @Column({ default: false })
  completed: boolean;

  /** 尝试次数（含失败的提交） */
  @Column({ default: 0 })
  attempts: number;

  /** 该关累计获得的积分 */
  @Column({ default: 0 })
  pointsEarned: number;

  /** 是否已解锁过标准答案（解锁过则不再重复扣分） */
  @Column({ default: false })
  answerUnlocked: boolean;

  /** 完成时间（未完成则为 null） */
  @Column({ type: 'datetime', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
