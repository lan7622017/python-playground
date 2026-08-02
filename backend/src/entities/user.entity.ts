// 用户实体
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  /** 昵称（登录名，唯一） */
  @Column({ unique: true })
  nickname: string;

  /** 密码哈希（scrypt，格式：盐:哈希） */
  @Column()
  passwordHash: string;

  /** 总积分 */
  @Column({ default: 0 })
  totalPoints: number;

  /** 当前进度（已通关的最大关卡顺序，0 表示还未通关） */
  @Column({ default: 0 })
  currentLevelOrder: number;

  @CreateDateColumn()
  createdAt: Date;
}
