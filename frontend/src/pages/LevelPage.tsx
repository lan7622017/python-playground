// 关卡页（核心玩法）：剧情横幅 → 知识点 → 提示 → 编辑器 → 运行判定 → 通关动画 + 徽章 + 解锁下一关
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { SubmitResult, SubmitLevelResponse, ViewAnswerResponse } from 'python-playground-shared';
import CodeEditor from '../components/CodeEditor';
import HintPanel from '../components/HintPanel';
import Markdown from '../components/Markdown';
import OutputPanel from '../components/OutputPanel';
import StoryBanner from '../components/StoryBanner';
import { engine, type EngineStatus } from '../engine/runner';
import { api } from '../api/client';
import { useAuth } from '../store/auth';
import { useLevels } from '../store/levels';
import { useTheme } from '../store/theme';

/** 通关奖励弹窗状态 */
interface RewardState {
  response: SubmitLevelResponse;
  levelTitle: string;
}

export default function LevelPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { levels, refresh } = useLevels();
  const { theme } = useTheme();

  const level = useMemo(() => levels?.find((l) => l.id === Number(id)) ?? null, [levels, id]);

  // 编辑器内容（初始为 starterCode）
  const [code, setCode] = useState('');
  // 已使用的提示数量（决定扣分）
  const [hintsUsed, setHintsUsed] = useState(0);
  // 最近一次运行结果
  const [result, setResult] = useState<SubmitResult | null>(null);
  // 是否正在运行
  const [running, setRunning] = useState(false);
  // 引擎状态（加载中/就绪/出错）
  const [engineStatus, setEngineStatus] = useState<EngineStatus>({ state: 'idle' });
  // 通关奖励弹窗
  const [reward, setReward] = useState<RewardState | null>(null);
  // 提交出错信息
  const [submitError, setSubmitError] = useState<string | null>(null);
  // 标准答案（查看后展示在独立面板）
  const [answer, setAnswer] = useState<ViewAnswerResponse | null>(null);
  // 答案加载中
  const [answerLoading, setAnswerLoading] = useState(false);
  // 未通关查看答案的确认弹窗
  const [confirmAnswer, setConfirmAnswer] = useState(false);
  // 答案已复制提示
  const [copied, setCopied] = useState(false);

  // 订阅引擎状态（加载进度/就绪/错误）
  useEffect(() => engine.subscribe(setEngineStatus), []);

  // 关卡切换时重置编辑器内容与运行状态
  useEffect(() => {
    if (level) {
      setCode(level.starterCode);
      setHintsUsed(0);
      setResult(null);
      setSubmitError(null);
      setAnswer(null);
      setConfirmAnswer(false);
      setCopied(false);
    }
  }, [level?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 关卡不存在：回地图
  useEffect(() => {
    if (levels && !level) {
      navigate('/map', { replace: true });
    }
  }, [levels, level, navigate]);

  // 未解锁：回地图
  useEffect(() => {
    if (level && !level.unlocked) {
      navigate('/map', { replace: true });
    }
  }, [level, navigate]);

  const engineStatusText = useMemo(() => {
    if (engineStatus.state === 'loading') return 'Python 引擎加载中…（首次约 10~30 秒）';
    if (engineStatus.state === 'error') return `引擎出错：${engineStatus.message}`;
    return '';
  }, [engineStatus]);

  /** 运行代码：拼接 用户代码 + 测试代码，交给引擎判定 */
  const runCode = useCallback(async () => {
    if (!level || running) return;
    setRunning(true);
    setResult(null);
    setSubmitError(null);
    try {
      const fullCode = `${code}\n\n# ===== 以下为系统测试代码，请勿修改 =====\n${level.testCode}`;
      // 传入用户代码行数，让错误行号映射回编辑器（排除拼接的测试代码）
      const runResult = await engine.run(fullCode, code.split('\n').length);
      setResult(runResult);
      if (runResult.passed) {
        // 首次通关才提交（防止重复通关刷积分/尝试次数）
        if (!level.completed) {
          const response = await api.submit(level.id, { passed: true, hintsUsed });
          setReward({ response, levelTitle: level.title });
          void refresh();
          void refreshUser();
        } else {
          // 已通关重玩：本地提示不加分
          setResult({ ...runResult, stdout: `${runResult.stdout}\n（本关已通关，重玩不再加分）`.trim() });
        }
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }, [level, running, code, hintsUsed, refresh, refreshUser]);

  /** 看提示：每次 +1（扣分由后端在通关时计算） */
  const revealHint = useCallback(() => {
    if (!level) return;
    setHintsUsed((prev) => Math.min(prev + 1, level.hints.length));
  }, [level]);

  /** 拉取标准答案（通关免费；未通关时后端扣 5 积分） */
  const fetchAnswer = useCallback(async () => {
    if (!level || answerLoading) return;
    setAnswerLoading(true);
    try {
      const res = await api.answer(level.id);
      setAnswer(res);
      setCopied(false);
      // 扣了积分就刷新用户信息（顶部积分数字同步）
      if (res.pointsDeducted > 0) void refreshUser();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setAnswerLoading(false);
    }
  }, [level, answerLoading, refreshUser]);

  /** 点"标准答案"：已通关或已解锁过答案直接看，未解锁过先确认 */
  const handleViewAnswer = useCallback(() => {
    if (!level) return;
    if (level.completed || level.answerUnlocked) {
      void fetchAnswer();
    } else {
      setConfirmAnswer(true);
    }
  }, [level, fetchAnswer]);

  /** 复制答案到剪贴板 */
  const copyAnswer = useCallback(async () => {
    if (!answer) return;
    try {
      await navigator.clipboard.writeText(answer.answerCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板不可用时静默忽略
    }
  }, [answer]);

  if (!level) {
    return <div className="page">关卡加载中…</div>;
  }

  return (
    <div className="page level-page">
      <StoryBanner
        chapter={level.chapter}
        title={level.title}
        story={level.story}
        order={level.order}
        completed={level.completed}
      />

      {/* 知识点讲解 */}
      <section className="level-knowledge card">
        <h2 className="section-title">📚 知识点</h2>
        <Markdown content={level.contentMd} />
      </section>

      {/* 提示面板 */}
      <HintPanel
        hints={level.hints}
        revealedCount={hintsUsed}
        points={level.points}
        onReveal={revealHint}
      />

      {/* 代码编辑 + 运行 */}
      <section className="level-editor card">
        <div className="level-editor-header">
          <h2 className="section-title">✏️ 编写代码</h2>
          <div className="level-editor-actions">
            <span className="level-reward">通关奖励：🏆 {level.points} 积分</span>
            <button
              className="btn btn-ghost"
              onClick={handleViewAnswer}
              disabled={answerLoading}
              title="通关后免费查看；未通关查看会扣 5 积分"
            >
              {answerLoading ? '加载中…' : '📖 标准答案'}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => void runCode()}
              disabled={running || engineStatus.state === 'error'}
            >
              {running ? '运行中…' : '▶ 运行代码'}
            </button>
          </div>
        </div>
        <CodeEditor
          key={level.id}
          value={code}
          onChange={setCode}
          dark={theme === 'dark'}
          placeholder="# 在这里写你的 Python 代码"
        />
      </section>

      {/* 运行输出 */}
      <OutputPanel
        result={result}
        running={running}
        engineLoading={engineStatus.state === 'loading'}
        engineStatusText={engineStatusText}
      />

      {/* 标准答案面板（独立于编辑器展示） */}
      {answer && (
        <section className="level-answer card">
          <div className="level-answer-header">
            <h2 className="section-title">📖 标准答案</h2>
            <div className="level-answer-actions">
              {answer.pointsDeducted > 0 && (
                <span className="level-answer-cost">本次查看扣除 {answer.pointsDeducted} 积分</span>
              )}
              <button className="btn btn-ghost" onClick={() => void copyAnswer()}>
                {copied ? '✅ 已复制' : '📋 复制答案'}
              </button>
            </div>
          </div>
          <div className="answer-code-block">{answer.answerCode}</div>
          <p className="level-answer-tip">
            💡 建议先自己尝试，实在卡住了再看答案；本关通关后可免费查看。
          </p>
        </section>
      )}

      {submitError && <div className="submit-error">⚠️ 提交失败：{submitError}</div>}

      {/* 操作按钮 */}
      <div className="level-footer-actions">
        <button className="btn btn-ghost" onClick={() => navigate('/map')}>
          ← 返回地图
        </button>
        {level.completed && (
          <span className="level-completed-note">本关已完成 ✓（可重玩巩固，不再加分）</span>
        )}
      </div>

      {/* 通关奖励弹窗 */}
      {reward && (
        <div className="modal-mask" onClick={() => setReward(null)}>
          <div className="modal reward-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reward-emoji">🎉</div>
            <h2 className="reward-title">通关成功！</h2>
            <div className="reward-level">{reward.levelTitle}</div>
            {reward.response.firstTime ? (
              <div className="reward-body">
                <div className="reward-points">+{reward.response.pointsEarned} 积分</div>
                {reward.response.badge && (
                  <div className="reward-badge">
                    <span className="reward-badge-icon">{reward.response.badge.icon}</span>
                    <span>
                      获得徽章 <strong>{reward.response.badge.name}</strong>
                    </span>
                    <span className="reward-badge-desc">{reward.response.badge.description}</span>
                  </div>
                )}
                <div className="reward-total">当前总积分：{reward.response.totalPoints}</div>
              </div>
            ) : (
              <div className="reward-body">
                <div className="reward-points">重复通关，本次不加分</div>
                <div className="reward-total">当前总积分：{reward.response.totalPoints}</div>
              </div>
            )}
            <div className="reward-actions">
              {reward.response.nextLevelId ? (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const nextId = reward.response.nextLevelId;
                    setReward(null);
                    navigate(`/level/${nextId}`);
                  }}
                >
                  挑战下一关 →
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => setReward(null)}>
                  太棒了，全部通关！
                </button>
              )}
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setReward(null);
                  void fetchAnswer();
                }}
              >
                📖 查看标准答案
              </button>
              <button className="btn btn-ghost" onClick={() => setReward(null)}>
                返回地图
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 未通关查看答案确认弹窗 */}
      {confirmAnswer && (
        <div className="modal-mask" onClick={() => setConfirmAnswer(false)}>
          <div className="modal answer-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="reward-title">查看标准答案？</h2>
            <p className="answer-confirm-text">
              未通关时查看答案将扣除 <strong>5 积分</strong>（本关通关后可免费查看）。
              <br />
              确定现在就要看吗？
            </p>
            <div className="reward-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setConfirmAnswer(false);
                  void fetchAnswer();
                }}
              >
                确定查看
              </button>
              <button className="btn btn-ghost" onClick={() => setConfirmAnswer(false)}>
                再想想
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 引擎出错提示 */}
      {engineStatus.state === 'error' && (
        <div className="engine-error">
          ⚠️ Python 执行引擎加载失败（可能是网络原因）。请检查网络后刷新页面重试。
          <div className="engine-error-detail">{engineStatus.message}</div>
        </div>
      )}
    </div>
  );
}
