# 游戏化 Python 学习网站 · 项目计划与迭代记录

## 项目概述

为**零基础转行产品经理**打造的游戏化 Python 学习网站（Monorepo：`shared` 类型契约 / `backend` NestJS+SQLite / `frontend` React+Vite+Pyodide）。剧情主线：产品经理"小澜"入职星云科技，用 Python 解决职场问题。

**核心定位（AI 时代）**：训练"手搓代码 + 读懂/验证 AI 代码"双轨能力——手搓是支点，AI 是杠杆。

---

## 迭代记录

### 迭代四（2026-08）：扩展 AI 时代闯关关卡至 12 关

**背景**：用户目标是同时具备"自己手搓代码"与"看懂/验证 AI 代码"的能力——自己会写才能在 AI 辅助下达到更高上限。

**改动**：
- `backend/src/seed/levels.seed.ts`：新增第三章「AI 协作：读懂与验证」第 9~12 关（仅数据文件，业务代码零改动）：
  - 第 9 关「读懂 AI 的循环，自己写统计」（+55）：修复 AI 漏条件 bug、continue 跳过、手搓统计函数
  - 第 10 关「函数与模块：修复 AI 的，写出自己的」（+65）：修参数写反/return 缩进、手搓面积函数 + import
  - 第 11 关「异常与调试：AI 会崩，你得会修」（+75）：try/except 防御、手搓健壮均值函数
  - 第 12 关「综合实战：手搓验证 AI 的报告」（+90）：全程手搓，揭穿 AI 把退款计入销售额的错误结论
- `backend/src/modules/progress/badges.constant.ts`：注册徽章「代码验收员 🧰」「AI 协作大师 🤝」
- `backend/src/seed/run-seed.ts`：加固——数量校验 + 每关 `id==order` 校验（防未来加关破坏存量进度）

**约定**：新关卡 TODO 用 `【读 AI】`（读懂/修复 AI 代码）与 `【手搓】`（只给签名，自己写）标注；testCode 只断言结果/函数返回值，不查实现，数值用容差，模糊兜底值用成员断言（防"合法写法被判错"）。

**验证**：12 关标准答案本地全过；4 种替代写法回归全过；浏览器逐关通关至 12/12、积分 35→500、新徽章上墙、第 12 关"全部通关"边界正确、存量关卡无回归。

### 迭代三（2026-08）：标准答案系统（题目与答案分离）

**背景**：编辑器不应预填答案；标准答案放独立入口；通关后免费查看，未通关扣积分。

**改动**：
- shared 类型契约：`Level.answerCode`（仅答案接口返回）、`LevelListItem`（omit answerCode + answerUnlocked）、`ViewAnswerResponse`
- 8 关 seed 拆分：starterCode 骨架（None/[]/{} 占位 + TODO）+ answerCode 完整答案
- 后端 `POST /api/levels/:id/answer`：通关/已解锁免费；未通关首次扣 5 分（最低扣到 0），事务内标记 answerUnlocked 防并发重复扣
- 前端：答案面板 + 确认弹窗 + 复制按钮 + 通关弹窗入口

**验证**：全新账号完整积分流水验证通过（0 → 看答案 0 → 通关 +10 → 免费看 → 第 2 关看答案 -5）。

### 迭代二（2026-08）：浅色模式（深浅主题切换）

**改动**：
- CSS 变量主题系统：`:root` 深色 + `html[data-theme="light"]` 浅色覆盖集，通用组件变量（--nav-bg/--subtle-bg/--code-bg/--code-text/--spinner-track）
- `ThemeProvider` + `useTheme`，localStorage 持久化（`python-playground-theme`），未选择时跟随系统偏好
- CodeMirror 联动：`dark` prop 条件加载 oneDark；`syntaxHighlighting(defaultHighlightStyle, { fallback: true })` 修复深色下高亮混色
- 登录页 + 主界面双切换入口

**验证**：浏览器 8 项验收全过（登录/地图/关卡/编辑器/运行/弹窗/持久化/无报错）。

### 迭代一（2026-07）：项目初始化与核心功能

- Monorepo 搭建（shared/backend/frontend），8 关课程体系（第一、二章）
- 后端：NestJS + TypeORM + SQLite + JWT；注册/登录、关卡列表/详情/提交、积分、签到、徽章、个人中心
- 前端：React + Vite + CodeMirror 6 + Pyodide（浏览器内执行 Python，3 秒超时保护、错误中文化、输出截断）
- seed 脚本 `npm run seed`（幂等：清 levels 表 + 重置自增 ID，id==order 稳定，不影响 progress）

---

## 后续规划（待确认）

- 「给 AI 下指令」模拟题：中文需求 → AI 产出 → 用户验收（依赖读码/手搓能力，待基础打牢后迭代）
- 新题型扩展（选择题/判断题）：在 shared 增加可选字段（judgeMode/options），缺省即现有行为
- 地图页按章节分组展示（当前平铺）
