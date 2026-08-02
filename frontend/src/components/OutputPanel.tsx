// 运行输出面板：展示 stdout（终端风格）+ 判定结果 + 中文错误提示
import type { SubmitResult } from 'python-playground-shared';

interface OutputPanelProps {
  /** 最近一次运行结果（未运行过为 null） */
  result: SubmitResult | null;
  /** 是否正在运行 */
  running: boolean;
  /** 是否正在加载 Python 引擎 */
  engineLoading: boolean;
  /** 引擎加载进度文案（如「正在下载 Python 引擎 12%」） */
  engineStatusText: string;
}

export default function OutputPanel({
  result,
  running,
  engineLoading,
  engineStatusText,
}: OutputPanelProps) {
  return (
    <div className="output-panel">
      <div className="output-header">
        <span className="output-title">运行结果</span>
        {running && <span className="output-badge running">运行中…</span>}
        {!running && engineLoading && (
          <span className="output-badge loading">{engineStatusText}</span>
        )}
        {!running && result?.passed && <span className="output-badge passed">全部测试通过 ✅</span>}
        {!running && result && !result.passed && (
          <span className="output-badge failed">未通过 ❌</span>
        )}
      </div>

      <div className="output-body">
        {running && (
          <div className="output-placeholder">
            <span className="spinner" />
            <span>正在执行你的代码…</span>
          </div>
        )}

        {!running && !result && (
          <div className="output-placeholder">点击「运行代码」查看执行结果</div>
        )}

        {!running && result && (
          <>
            {result.stdout && (
              <pre className="output-stdout">{result.stdout}</pre>
            )}
            {result.error && (
              <div className="output-error">
                <div className="output-error-title">💡 问题出在哪</div>
                <div>{result.error}</div>
              </div>
            )}
            {!result.stdout && !result.error && result.passed && (
              <div className="output-placeholder">测试通过，没有输出内容（代码不需要 print）</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
