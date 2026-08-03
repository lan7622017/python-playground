/// <reference lib="webworker" />
// Pyodide 执行 Worker（classic worker）
// 通过 importScripts 从 CDN 加载 Pyodide，避免打包器兼容问题
import type { PyodideInterface } from 'pyodide';

// Pyodide 固定版本（与 package.json 中的 pyodide 包版本一致）
// 加载顺序：优先同源（部署在 nginx 静态目录 /pyodide/，快且稳定），再回退 jsdelivr CDN
const PYODIDE_SOURCES = [
  // 同源：生产环境为 nginx 托管的 /pyodide/；开发环境（localhost）无此路径会自动回退 CDN
  `${self.location.origin}/pyodide/`,
  'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
  'https://fastly.jsdelivr.net/pyodide/v0.26.4/full/',
];

/** 单个源加载超时（毫秒）：超时进入下一个源，防止某个源挂起导致无限等待 */
const SOURCE_TIMEOUT = 20000;

// 全局函数（由 CDN 的 pyodide.js 提供）
declare function importScripts(...urls: string[]): void;
declare function loadPyodide(config: { indexURL: string }): Promise<PyodideInterface>;

let pyodide: PyodideInterface | null = null;

/** 给 Promise 加超时：超时抛错（由调用方决定是否继续下一个源） */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/** 依次尝试各源加载 Pyodide，全部失败则抛错 */
async function loadPyodideWithFallback(): Promise<PyodideInterface> {
  let lastError: unknown = null;
  for (const src of PYODIDE_SOURCES) {
    try {
      // importScripts 同步加载；失败会抛异常，进入下一个源
      importScripts(`${src}pyodide.js`);
      if (typeof loadPyodide === 'function') {
        return await withTimeout(
          loadPyodide({ indexURL: src }),
          SOURCE_TIMEOUT,
          `加载超时（${SOURCE_TIMEOUT / 1000} 秒）`,
        );
      }
      throw new Error('pyodide.js 加载后未提供 loadPyodide');
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`所有 Pyodide 源均不可用：${String(lastError)}`);
}

/** worker 收到的消息 */
type WorkerMessage =
  | { type: 'load' }
  | { type: 'run'; code: string };

/** worker 发回的消息 */
type WorkerResponse =
  | { type: 'loaded' }
  | { type: 'result'; passed: boolean; stdout: string; error: string | null }
  | { type: 'error'; error: string };

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;

  // 加载 Pyodide（懒加载：首次需要时初始化）
  if (msg.type === 'load') {
    try {
      if (!pyodide) {
        pyodide = await loadPyodideWithFallback();
      }
      postMessage({ type: 'loaded' } satisfies WorkerResponse);
    } catch (err) {
      postMessage({ type: 'error', error: String(err) } satisfies WorkerResponse);
    }
    return;
  }

  // 执行用户代码 + 测试代码
  if (msg.type === 'run') {
    if (!pyodide) {
      postMessage({ type: 'error', error: 'Pyodide 尚未加载完成' } satisfies WorkerResponse);
      return;
    }
    try {
      // 捕获标准输出
      const stdoutLines: string[] = [];
      pyodide.setStdout({
        batched: (line: string) => stdoutLines.push(line),
      });
      // input() 返回空字符串，防止用户代码挂起等待输入
      pyodide.setStdin({ stdin: () => '' });

      // 每次运行使用全新的全局命名空间（隔离变量，防止上次运行的残留干扰判定）
      const globals = pyodide.toPy({});
      try {
        pyodide.runPython(msg.code, { globals });
        postMessage({
          type: 'result',
          passed: true,
          stdout: stdoutLines.join('\n'),
          error: null,
        } satisfies WorkerResponse);
      } finally {
        // 释放全局命名空间
        globals.destroy();
      }
    } catch (err) {
      // Python 错误的 message 包含完整 traceback，交给主线程做中文化
      const raw = err instanceof Error ? err.message : String(err);
      postMessage({
        type: 'result',
        passed: false,
        stdout: '',
        error: raw,
      } satisfies WorkerResponse);
    }
  }
};
