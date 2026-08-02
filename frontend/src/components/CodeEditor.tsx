// 代码编辑器（CodeMirror 6，懒加载：挂载时才动态加载编辑器核心，不拖慢首屏）
import { useEffect, useRef, useState } from 'react';
import type { EditorView } from '@codemirror/view';

interface CodeEditorProps {
  /** 代码内容（受控；外部变化会同步到编辑器） */
  value: string;
  /** 内容变化回调 */
  onChange: (value: string) => void;
  /** 是否只读 */
  readOnly?: boolean;
  /** 是否深色主题（true 用 oneDark，false 用 CodeMirror 默认亮色） */
  dark?: boolean;
  /** 编辑器高度 */
  height?: string;
  /** 占位提示 */
  placeholder?: string;
}

export default function CodeEditor({
  value,
  onChange,
  readOnly = false,
  dark = true,
  height = '340px',
  placeholder = '在这里写 Python 代码…',
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [loaded, setLoaded] = useState(false);

  // 始终持有最新的 value/onChange（供编辑器回调使用，避免重复初始化）
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 初始化编辑器（懒加载 CodeMirror 全部模块）
  useEffect(() => {
    let cancelled = false;
    let view: EditorView | null = null;

    (async () => {
      try {
        const [
          { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, placeholder: placeholderExt },
          { EditorState },
          { syntaxHighlighting, defaultHighlightStyle, foldGutter, bracketMatching, indentOnInput, foldKeymap },
          { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap },
          { defaultKeymap, indentWithTab, history, historyKeymap },
          { python },
          { oneDark },
        ] = await Promise.all([
          import('@codemirror/view'),
          import('@codemirror/state'),
          import('@codemirror/language'),
          import('@codemirror/autocomplete'),
          import('@codemirror/commands'),
          import('@codemirror/lang-python'),
          dark ? import('@codemirror/theme-one-dark') : Promise.resolve({ oneDark: null }),
        ]);
        if (cancelled || !containerRef.current) return;

        const state = EditorState.create({
          doc: valueRef.current,
          extensions: [
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightActiveLine(),
            highlightSpecialChars(),
            drawSelection(),
            dropCursor(),
            rectangularSelection(),
            crosshairCursor(),
            indentOnInput(),
            bracketMatching(),
            closeBrackets(),
            autocompletion(),
            foldGutter(),
            // fallback: true —— 默认浅色高亮只作回退，深色模式下 oneDark 高亮优先，避免混色
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            history(),
            placeholderExt(placeholder),
            readOnly ? EditorState.readOnly.of(true) : [],
            EditorView.lineWrapping,
            keymap.of([...closeBracketsKeymap, ...completionKeymap, ...foldKeymap, ...defaultKeymap, indentWithTab, ...historyKeymap]),
            python(),
            oneDark ? oneDark : [],
            EditorView.updateListener.of((u) => {
              if (u.docChanged) onChangeRef.current(u.state.doc.toString());
            }),
          ],
        });
        view = new EditorView({ state, parent: containerRef.current });
        viewRef.current = view;
        setLoaded(true);
      } catch (err) {
        console.error('CodeMirror 加载失败', err);
      }
    })();

    return () => {
      cancelled = true;
      view?.destroy();
      viewRef.current = null;
    };
    // readOnly/placeholder/dark 变化时重建编辑器（概率低，可接受）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, dark]);

  // 外部 value 变化 → 同步到编辑器（用 dispatch 替换全文）
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div className="code-editor" style={{ height }}>
      <div ref={containerRef} className="code-editor-container" />
      {!loaded && <div className="code-editor-loading">编辑器加载中…</div>}
    </div>
  );
}
