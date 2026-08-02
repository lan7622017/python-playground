// 剧情横幅（关卡页顶部）：章节 + 标题 + 剧情引子 + 状态
interface StoryBannerProps {
  chapter: string;
  title: string;
  story: string;
  order: number;
  completed: boolean;
}

export default function StoryBanner({ chapter, title, story, order, completed }: StoryBannerProps) {
  return (
    <div className="story-banner">
      <div className="story-banner-meta">
        <span className="story-chapter">📖 {chapter}</span>
        <span className="story-order">第 {order} 关</span>
        {completed && <span className="story-completed">✓ 已完成</span>}
      </div>
      <h1 className="story-title">{title}</h1>
      <p className="story-text">{story}</p>
    </div>
  );
}
