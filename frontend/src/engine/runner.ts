// 代码执行引擎（主线程封装）
// 职责：管理 Worker 生命周期、预加载、超时强制中断、错误中文化
import type { SubmitResult } from 'python-playground-shared';

/** 单次执行超时（毫秒）：超时强制终止 Worker，防止死循环卡死页面 */
const RUN_TIMEOUT = 3000;

/** 引擎加载超时（毫秒）：CDN 挂起/过慢时终止 Worker 并报错，避免无限转圈 */
const ENGINE_LOAD_TIMEOUT = 60000;

/** 输出内容上限（字符）：防止 print 刷屏 */
const MAX_OUTPUT_LENGTH = 2000;

/** 引擎状态（供 UI 展示加载进度） */
export type EngineStatus =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'ready' }
  | { state: 'error'; message: string };

/** 常见 Python 错误 → 中文提示映射表 */
const ERROR_HINTS: Array<[string, string]> = [
  ['NameError', '变量名写错了：有名字没定义。检查拼写，或看看是否还没赋值就使用了'],
  ['IndentationError', '缩进不对！Python 用缩进表示代码块，统一用 4 个空格'],
  ['SyntaxError', '语法错误：检查括号、冒号、引号是否成对，字符串要用引号包起来'],
  ['TypeError', '类型不对：可能把不同类型混用了（如字符串和数字相加），用 type() 检查变量类型'],
  ['KeyError', '键不存在：字典里没有这个键。检查键名拼写，或改用 get() 安全取值'],
  ['IndexError', '索引越界：列表/字符串长度不够。下标从 0 开始，检查范围'],
  ['ValueError', '值不对：可能对不合适的内容做了转换（如 int("abc")）'],
  ['ZeroDivisionError', '除以 0 了！检查除数是否可能为 0'],
  ['AssertionError', '测试未通过：看断言提示信息，对照题目要求检查你的结果'],
  ['AttributeError', '方法名写错了：对象没有这个属性/方法（如 append、replace），检查拼写'],
  ['EOFError', '代码不完整：可能少了括号或引号'],
];

/** 单例：整个应用共享一个执行引擎 */
export const engine = new (class PyodideRunner {
  private worker: Worker | null = null;
  private loadingPromise: Promise<void> | null = null;
  private statusListeners = new Set<(status: EngineStatus) => void>();
  private status: EngineStatus = { state: 'idle' };

  /** 订阅引擎状态变化（加载进度等） */
  subscribe(listener: (status: EngineStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(status: EngineStatus) {
    this.status = status;
    this.statusListeners.forEach((l) => l(status));
  }

  /** 创建 Worker（classic worker，不走打包器模块转换） */
  private createWorker(): Worker {
    return new Worker(new URL('./pyodide.worker.ts', import.meta.url));
  }

  /** 预加载 Pyodide（页面空闲时调用；幂等，失败可重试） */
  preload(): Promise<void> {
    if (this.loadingPromise) return this.loadingPromise;
    if (this.worker) return Promise.resolve();
    this.setStatus({ state: 'loading' });
    const loading = new Promise<void>((resolve, reject) => {
      const worker = this.createWorker();
      this.worker = worker;
      let settled = false;

      // 加载超时保护：引擎下载挂起时终止 Worker 并报错，避免 UI 无限转圈
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        this.terminateWorker();
        this.setStatus({
          state: 'error',
          message: `引擎加载超时（${ENGINE_LOAD_TIMEOUT / 1000} 秒），请检查网络后刷新重试`,
        });
        reject(new Error(`引擎加载超时（${ENGINE_LOAD_TIMEOUT / 1000} 秒）`));
      }, ENGINE_LOAD_TIMEOUT);

      // Worker 脚本加载失败（404/语法错误等）
      worker.onerror = (e) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        this.terminateWorker();
        this.setStatus({ state: 'error', message: `执行引擎出错：${e.message}` });
        reject(new Error(e.message));
      };

      worker.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === 'loaded') {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          this.setStatus({ state: 'ready' });
          resolve();
        } else if (msg.type === 'error') {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          this.terminateWorker();
          this.setStatus({ state: 'error', message: msg.error });
          reject(new Error(msg.error));
        }
      };
      worker.postMessage({ type: 'load' });
    }).finally(() => {
      // 无论成败都允许下次重新加载（成功时 worker 已存在，直接走 ready 分支）
      this.loadingPromise = null;
    });
    this.loadingPromise = loading;
    return loading;
  }

  /** 执行代码（拼接测试代码由调用方完成），返回判定结果 */
  async run(code: string, userCodeLines?: number): Promise<SubmitResult> {
    // 安全预检：检测 input()（浏览器端无标准输入）
    const precheckError = this.precheck(code);
    if (precheckError) {
      return { passed: false, stdout: '', error: precheckError, hintsUsed: 0 };
    }
    // 确保已加载
    await this.preload();

    return new Promise<SubmitResult>((resolve) => {
      const worker = this.worker;
      if (!worker) {
        resolve({ passed: false, stdout: '', error: '执行引擎不可用，请刷新页面', hintsUsed: 0 });
        return;
      }

      // 超时保护：死循环代码强制终止 Worker
      const timer = setTimeout(() => {
        this.terminateWorker();
        resolve({
          passed: false,
          stdout: '',
          error: '⏰ 执行超时（3 秒）：代码可能陷入了死循环，检查循环条件',
          hintsUsed: 0,
        });
      }, RUN_TIMEOUT);

      worker.onmessage = (e) => {
        clearTimeout(timer);
        const msg = e.data;
        if (msg.type === 'result') {
          resolve({
            passed: msg.passed,
            stdout: this.truncate(msg.stdout),
            error: msg.passed ? null : this.translateError(msg.error ?? '', userCodeLines),
            hintsUsed: 0,
          });
        } else if (msg.type === 'error') {
          resolve({
            passed: false,
            stdout: '',
            error: `⚠️ 运行环境出错：${msg.error}`,
            hintsUsed: 0,
          });
        }
      };
      worker.postMessage({ type: 'run', code });
    });
  }

  /** 终止当前 Worker（超时后调用；下次 run 会自动重建） */
  private terminateWorker() {
    this.worker?.terminate();
    this.worker = null;
    this.loadingPromise = null;
    this.setStatus({ state: 'idle' });
  }

  /** 代码预检：返回错误提示，无问题返回 null */
  private precheck(code: string): string | null {
    if (/\binput\s*\(/.test(code)) {
      return '这个关卡不支持 input() 输入，题目数据已经写在代码里了，直接处理即可';
    }
    return null;
  }

  /** 截断过长输出 */
  private truncate(stdout: string): string {
    if (stdout.length <= MAX_OUTPUT_LENGTH) return stdout;
    return `${stdout.slice(0, MAX_OUTPUT_LENGTH)}\n……（输出过长已截断）`;
  }

  /** Python 错误中文化：提取用户代码行号 + 映射常见错误为友好提示 */
  private translateError(raw: string, userCodeLines?: number): string {
    // 优先取用户代码帧（<exec>）的行号；取不到时取最后一个 line N（traceback 最内层帧 = 用户代码）
    let lineNo: number | null = null;
    const execMatch = raw.match(/File "<exec>", line (\d+)/);
    if (execMatch) {
      lineNo = Number(execMatch[1]);
    } else {
      const allLines = raw.match(/line (\d+)/g) ?? [];
      const last = allLines[allLines.length - 1];
      const lastNo = last ? Number(last.match(/\d+/)?.[0]) : NaN;
      if (Number.isFinite(lastNo)) lineNo = lastNo;
    }

    // 行号映射：拼接代码 = 用户代码 + 空行 + 分隔注释 + 测试代码，换算回编辑器里的行号
    let lineInfo = '';
    if (lineNo !== null) {
      if (userCodeLines && lineNo > userCodeLines) {
        // 错误落在分隔区/测试代码里，不属于用户代码
        lineInfo = lineNo > userCodeLines + 2 ? '（系统测试代码部分）' : '';
      } else {
        lineInfo = `（第 ${lineNo} 行）`;
      }
    }

    // 取 traceback 最后一行（错误类型 + 消息）
    const lines = raw.trim().split('\n');
    const lastLine = lines[lines.length - 1] ?? raw;
    // 常见错误映射
    for (const [prefix, hint] of ERROR_HINTS) {
      if (lastLine.startsWith(prefix)) {
        return `${hint}${lineInfo}`;
      }
    }
    // 兜底：直接展示原始错误
    return `出错了${lineInfo}：${lastLine}`;
  }
})();
