// 徽章常量表：所有徽章的元数据（id 与关卡 seed 中的 badgeId 对应）
import type { Badge } from 'python-playground-shared';

export const BADGES: Record<string, Badge> = {
  // 第一章：基础语法
  'badge-level-2': {
    id: 'badge-level-2',
    name: '语法新星',
    description: '通关第 2 关：掌握 f-string 输出',
    icon: '⭐',
  },
  'badge-level-4': {
    id: 'badge-level-4',
    name: '数据整理师',
    description: '通关第 4 关：精通列表操作',
    icon: '📋',
  },
  'badge-level-6': {
    id: 'badge-level-6',
    name: '字典大师',
    description: '通关第 6 关：玩转字典结构',
    icon: '🗂️',
  },
  // 第二章：数据魔法
  'badge-level-8': {
    id: 'badge-level-8',
    name: '数据分析师',
    description: '通关第 8 关：完成订单数据分析',
    icon: '📊',
  },
  // 第三章：AI 协作：读懂与验证
  'badge-level-10': {
    id: 'badge-level-10',
    name: '代码验收员',
    description: '通关第 10 关：修复并手写函数',
    icon: '🧰',
  },
  'badge-level-12': {
    id: 'badge-level-12',
    name: 'AI 协作大师',
    description: '通关第 12 关：手搓验证 AI 的报告',
    icon: '🤝',
  },
};
