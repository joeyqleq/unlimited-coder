"use client";

import dynamic from 'next/dynamic';
import { useIDEState } from '@/lib/ideState';
import { getPuter } from '@/lib/puterClient';
import { useCallback, useEffect, useRef, useState } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  showMinimap: boolean;
}

export function CodeEditor({ showMinimap }: CodeEditorProps) {
  const { currentFile, editorContent, setEditorContent, backend } = useIDEState();
  const [isCompleting, setIsCompleting] = useState(false);
  const editorRef = useRef<any>(null);
  const onChange = useCallback(
    (value: string | undefined) => {
      setEditorContent(value ?? '');
    },
    [setEditorContent],
  );
  async function onSave() {
      const path = currentFile;
      if (!path) return;
      await (await import('@/lib/fsClient')).writeFile(path, editorContent, backend);
  }
  async function onComplete() {
    if (!currentFile) return;
    setIsCompleting(true);
    try {
      const puter = getPuter();
      if (!puter) throw new Error('Puter not loaded');
      const prompt =
        'You are a coding assistant. Given the following code, suggest the next few lines or a useful snippet to continue the implementation.\n\n' +
        editorContent;
      let suggestion = '';
      const stream = await puter.ai.chat(prompt, {
        model: useIDEState.getState().modelId,
        stream: true,
      });
      for await (const token of stream) {
        suggestion += token;
      }
      const editor = editorRef.current?.editor;
      if (editor) {
        const selection = editor.getSelection();
        editor.executeEdits('', [
          {
            range: selection,
            text: suggestion,
            forceMoveMarkers: true,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompleting(false);
    }
  }
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleGoToLine = () => {
      const editor = editorRef.current?.editor;
      if (!editor) return;
      const input = prompt('Go to line number:');
      if (!input) return;
      const line = parseInt(input, 10);
      if (Number.isNaN(line) || line <= 0) return;
      editor.revealLineInCenter(line);
      editor.setPosition({ lineNumber: line, column: 1 });
      editor.focus();
    };
    const handleGoToSymbol = () => {
      const editor = editorRef.current?.editor;
      if (!editor) return;
      const symbol = prompt('Go to symbol name:');
      if (!symbol) return;
      const model = editor.getModel();
      if (!model) return;
      const [match] = model.findMatches(symbol, false, false, false, null, false);
      if (match) {
        editor.revealRangeInCenter(match.range);
        editor.setSelection(match.range);
        editor.focus();
      } else {
        alert(`Symbol "${symbol}" not found in current file.`);
      }
    };
    window.addEventListener('ide:go-to-line', handleGoToLine as EventListener);
    window.addEventListener('ide:go-to-symbol', handleGoToSymbol as EventListener);
    return () => {
      window.removeEventListener('ide:go-to-line', handleGoToLine as EventListener);
      window.removeEventListener('ide:go-to-symbol', handleGoToSymbol as EventListener);
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="h-7 flex items-center justify-between px-2 border-b border-neutral-800 text-[11px]">
        <div className="truncate text-neutral-400">{currentFile ?? 'No file selected'}</div>
        <div className="flex items-center gap-1">
          <button
            onClick={onComplete}
            disabled={isCompleting}
            className="px-2 py-0.5 rounded bg-purple-600 text-[11px] text-white disabled:bg-neutral-700"
          >
            {isCompleting ? 'Completing…' : 'Complete'}
          </button>
          <button
            onClick={onSave}
            className="px-2 py-0.5 rounded bg-emerald-600 text-[11px] text-white"
          >
            Save
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language="typescript"
          theme="vs-dark"
          value={editorContent}
          onChange={onChange}
          options={{ fontSize: 13, minimap: { enabled: showMinimap }, wordWrap: 'on', smoothScrolling: true }}
          onMount={(editor) => {
            editorRef.current = { editor };
          }}
        />
      </div>
    </div>
  );
}
