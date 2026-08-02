// 关卡卡片（地图页）：显示状态（锁定/可挑战/已完成）+ 章节 + 积分 + 徽章
import type { LevelListItem } from 'python-playground-shared';

interface LevelCardProps {
  level: LevelListItem;
  onClick: () => void;
}

export default function LevelCard({ level, onClick }: LevelCardProps) {
  const statusClass = level.completed ? 'is-completed' : level.unlocked ? 'is-unlocked' : 'is-locked';

  return (
    <button
      className={`level-card ${statusClass}`}
      onClick={onClick}
      disabled={!level.unlocked}
      title={level.unlocked ? level.title : '通关前一关即可解锁'}
    >
      <div className="level-card-top">
        <span className="level-order">{level.order}</span>
        <span className="level-status">
          {level.completed ? '✓ 已完成' : level.unlocked ? '⚡ 可挑战' : '🔒 未解锁'}
        </span>
      </div>
      <div className="level-card-body">
        <div className="level-chapter">{level.chapter}</div>
        <div className="level-title">{level.title}</div>
        <div className="level-story">{level.story}</div>
      </div>
      <div className="level-card-bottom">
        <span className="level-points">🏆 {level.points} 积分</span>
        {level.badgeId && <span className="level-badge">🎖 徽章</span>}
      </div>
    </button>
  );
}
