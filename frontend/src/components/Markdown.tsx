// 极简 Markdown 渲染（不引入额外依赖，仅支持关卡知识点用到的语法）
// 支持：# 标题 / - 列表 / ``` 代码块 / **加粗** / `行内代码` / 普通段落
import { memo } from 'react';

/** 将一行内联语法转为 JSX（加粗 + 行内代码） */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // 按 `行内代码` 和 **加粗** 分段
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`')) {
      nodes.push(
        <code key={`${keyPrefix}-${i}`} className="md-inline-code">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(
        <strong key={`${keyPrefix}-${i}`} className="md-bold">
          {token.slice(2, -2)}
        </strong>,
      );
    }
    lastIndex = match.index + token.length;
    i++;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

/** Markdown 内容渲染 */
function Markdown({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 代码块：``` 开头
    if (line.trimStart().startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // 跳过结束的 ```
      blocks.push(
        <pre key={key++} className="md-code-block">
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // 标题：# / ## / ###
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
      blocks.push(
        <Tag key={key++} className={`md-heading md-h${level}`}>
          {renderInline(heading[2], `h${key}`)}
        </Tag>,
      );
      i++;
      continue;
    }

    // 无序列表：连续 - 开头
    if (/^\s*-\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        const text = lines[i].replace(/^\s*-\s+/, '');
        items.push(<li key={i}>{renderInline(text, `li${i}`)}</li>);
        i++;
      }
      blocks.push(
        <ul key={key++} className="md-list">
          {items}
        </ul>,
      );
      continue;
    }

    // 空行：跳过（保留段落分隔）
    if (line.trim() === '') {
      i++;
      continue;
    }

    // 普通段落：连续收集
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trimStart().startsWith('```') &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !/^\s*-\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="md-paragraph">
        {renderInline(paraLines.join(' '), `p${key}`)}
      </p>,
    );
  }

  return <div className="markdown">{blocks}</div>;
}

export default memo(Markdown);
