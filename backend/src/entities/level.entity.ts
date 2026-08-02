// 关卡实体（内容由 seed 脚本写入）
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('levels')
export class Level {
  @PrimaryGeneratedColumn()
  id: number;

  /** 关卡顺序（从 1 开始） */
  @Column({ unique: true })
  order: number;

  /** 章节名（剧情主线章节） */
  @Column()
  chapter: string;

  /** 关卡标题 */
  @Column()
  title: string;

  /** 剧情引子（一句故事背景） */
  @Column({ type: 'text' })
  story: string;

  /** 知识点讲解内容（Markdown 格式） */
  @Column({ type: 'text' })
  contentMd: string;

  /** 初始代码（编辑器预填充） */
  @Column({ type: 'text' })
  starterCode: string;

  /** 测试代码（拼接在用户代码之后执行） */
  @Column({ type: 'text' })
  testCode: string;

  /** 标准答案代码（只通过查看答案接口返回） */
  @Column({ type: 'text' })
  answerCode: string;

  /** 提示列表（simple-json 存储为数组） */
  @Column({ type: 'simple-json' })
  hints: string[];

  /** 通关奖励积分 */
  @Column()
  points: number;

  /** 关联徽章 ID（可为空） */
  @Column({ type: 'varchar', nullable: true })
  badgeId: string | null;
}
