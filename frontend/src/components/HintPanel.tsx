// 提示面板：分 3 级逐步解锁提示（每用 1 个提示扣 5 分，最低 5 分）
interface HintPanelProps {
  /** 本关提示列表（3 级） */
  hints: string[];
  /** 已展示的提示数量 */
  revealedCount: number;
  /** 本关满分解锁的积分 */
  points: number;
  /** 点击「看提示」回调 */
  onReveal: () => void;
}

export default function HintPanel({ hints, revealedCount, points, onReveal }: HintPanelProps) {
  const allRevealed = revealedCount >= hints.length;
  // 剩余提示扣分说明：最多扣到 0（保底 5 分）
  const remainingDeduct = Math.min((hints.length - revealedCount) * 5, points - 5);

  return (
    <div className="hint-panel">
      <div className="hint-header">
        <span className="hint-title">💡 需要提示？</span>
        {remainingDeduct > 0 ? (
          <span className="hint-cost">看提示会扣 {remainingDeduct} 分（本关保底 5 分）</span>
        ) : (
          <span className="hint-cost">提示已全部解锁</span>
        )}
      </div>

      <div className="hint-list">
        {hints.slice(0, revealedCount).map((hint, i) => (
          <div key={i} className={`hint-item ${i === revealedCount - 1 ? 'hint-item-new' : ''}`}>
            <span className="hint-level">提示 {i + 1}</span>
            <span>{hint}</span>
          </div>
        ))}
      </div>

      {!allRevealed && (
        <button className="btn btn-ghost hint-button" onClick={onReveal}>
          {revealedCount === 0 ? '看第 1 条提示（-5 分）' : `再看第 ${revealedCount + 1} 条提示（-5 分）`}
        </button>
      )}
    </div>
  );
}
