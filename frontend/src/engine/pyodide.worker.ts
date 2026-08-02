/// <reference lib="webworker" />
// Pyodide 执行 Worker（classic worker）
// 通过 importScripts 从 CDN 加载 Pyodide，避免打包器兼容问题
import type { PyodideInterface } from 'pyodide';

// Pyodide 固定版本（与 package.json 中的 pyodide 包版本一致）
// 多 CDN 回退：主用 jsdelivr（实测可达），备选 fastly 节点
const PYODIDE_CDNS = [
  'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
  'https://fastly.jsdelivr.net/pyodide/v0.26.4/full/',
];

// 全局函数（由 CDN 的 pyodide.js 提供）
declare function importScripts(...urls: string[]): void;
declare function loadPyodide(config: { indexURL: string }): Promise<PyodideInterface>;

let pyodide: PyodideInterface | null = null;

/** 依次尝试各 CDN 加载 Pyodide，全部失败则抛错 */
async function loadPyodideWithFallback(): Promise<PyodideInterface> {
  let lastError: unknown = null;
  for (const cdn of PYODIDE_CDNS) {
    try {
      // importScripts 同步加载；失败会抛异常，进入下一个 CDN
      importScripts(`${cdn}pyodide.js`);
      if (typeof loadPyodide === 'function') {
        return await loadPyodide({ indexURL: cdn });
      }
      throw new Error('pyodide.js 加载后未提供 loadPyodide');
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`所有 Pyodide CDN 均不可用：${String(lastError)}`);
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
