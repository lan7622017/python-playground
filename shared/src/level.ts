// 关卡相关类型定义（前后端共享契约，禁止两端各自重复定义）

/** 关卡信息 */
export interface Level {
  /** 关卡 ID（数据库主键） */
  id: number;
  /** 关卡顺序（从 1 开始，通关前 N-1 关才能进入第 N 关） */
  order: number;
  /** 章节名（剧情主线章节） */
  chapter: string;
  /** 关卡标题 */
  title: string;
  /** 剧情引子（一句故事背景） */
  story: string;
  /** 知识点讲解内容（Markdown 格式） */
  contentMd: string;
  /** 初始代码（编辑器预填充，只含题目骨架，不含答案） */
  starterCode: string;
  /** 测试代码（拼接在用户代码之后执行，断言式验证） */
  testCode: string;
  /** 标准答案代码（仅通过查看答案接口返回，不出现在关卡列表中） */
  answerCode: string;
  /** 提示列表（分 3 级；使用提示会扣减积分） */
  hints: string[];
  /** 通关奖励积分 */
  points: number;
  /** 关联徽章 ID（通关获得，可为空） */
  badgeId: string | null;
}

/** 关卡列表项（附加用户的解锁/完成状态；不含标准答案） */
export interface LevelListItem extends Omit<Level, 'answerCode'> {
  /** 是否已解锁（可进入） */
  unlocked: boolean;
  /** 是否已完成 */
  completed: boolean;
  /** 是否已解锁过标准答案（解锁后重复查看不再扣分/不再确认） */
  answerUnlocked: boolean;
}

/** 代码执行判定结果（前端 Pyodide 判定后回传后端） */
export interface SubmitResult {
  /** 是否全部测试通过 */
  passed: boolean;
  /** 用户代码的标准输出 */
  stdout: string;
  /** 错误信息（未通过时的友好中文提示） */
  error: string | null;
  /** 本次使用了几个提示（用于扣分） */
  hintsUsed: number;
}

/** 通关提交请求（前端只传判定结果，不传代码） */
export interface SubmitLevelRequest {
  passed: boolean;
  hintsUsed: number;
}

/** 通关提交响应 */
export interface SubmitLevelResponse {
  /** 是否首次通关（首次才发放积分/徽章） */
  firstTime: boolean;
  /** 本次获得的积分（重复通关为 0） */
  pointsEarned: number;
  /** 获得的徽章（没有则为 null） */
  badge: Badge | null;
  /** 更新后的总积分 */
  totalPoints: number;
  /** 新解锁的下一关 ID（没有则为 null） */
  nextLevelId: number | null;
}

/** 查看标准答案响应：已通关或已解锁过答案时不扣分，否则扣 5 分 */
export interface ViewAnswerResponse {
  /** 标准答案代码 */
  answerCode: string;
  /** 本次扣除的积分（0 = 未扣分） */
  pointsDeducted: number;
  /** 更新后的总积分 */
  totalPoints: number;
}

/** 徽章信息 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  /** 徽章图标（emoji） */
  icon: string;
}
