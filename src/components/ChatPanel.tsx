"use client";

import { FormEvent, useEffect, useRef, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useIDEState } from '@/lib/ideState';
import { getPuter } from '@/lib/puterClient';
import { randomId } from '@/lib/randomId';
import { listFiles, readFile, writeFile, createEntry, deleteEntry, applyPatch, saveSummary, getSummary } from '@/lib/fsClient';

/**
 * ChatPanel now supports tool calling for advanced file operations, summary
 * generation, patch application, command execution, and summary retrieval. It
 * also routes messages to external providers when selected and stores
 * conversation history in Puter KV for long-term memory. Streaming
 * auto‑completion is implemented in CodeEditor (separate component).
 */
export function ChatPanel() {
  const {
    chat,
    appendChat,
    modelId,
    providerId,
    providers,
    npcId,
    npcs,
    backend,
    projectRoot,
    setFiles,
    files,
  } = useIDEState();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Restore chat history from KV on first render
  useEffect(() => {
    (async () => {
      const puter = getPuter();
      if (!puter) return;
      try {
        const stored = await puter.kv.get('ultimate_coder_history');
        if (Array.isArray(stored)) {
          useIDEState.getState().replaceChat(
            stored.map((m: any) => ({
              id: randomId(),
              role: m.role,
              content: normalizeContent(m.content),
            }))
          );
        }
      } catch (err) {
        console.error('Failed to restore chat', err);
      }
    })();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.length]);

  function buildMessages(userContent: string) {
    const npc = npcs.find((n) => n.id === npcId);
    const systemContent = npc
      ? npc.systemPrompt
      : 'You are an AI coding assistant. Use the provided tools to read, write, create, delete, and summarize files. Keep responses concise.';
    const history = chat.map((m) => ({ role: m.role, content: m.content }));
    return [
      { role: 'system', content: systemContent },
      ...history,
      { role: 'user', content: userContent },
    ];
  }

  // Normalize model responses that may come as structured segments/objects
  function normalizeContent(content: any): string {
    if (content == null) return '';
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .map((c) =>
          typeof c === 'string'
            ? c
            : typeof c?.text === 'string'
            ? c.text
            : typeof c?.content === 'string'
            ? c.content
            : ''
        )
        .join('\n')
        .trim();
    }
    if (typeof content === 'object') {
      if (typeof (content as any).text === 'string') return (content as any).text;
      if (typeof (content as any).content === 'string') return (content as any).content;
      try {
        return JSON.stringify(content, null, 2);
      } catch {
        return String(content);
      }
    }
    return String(content);
  }

  // Define tool schemas
  const tools = [
    {
      type: 'function',
      function: {
        name: 'list_files',
        description: 'List files in a directory',
        parameters: {
          type: 'object',
          properties: { dir: { type: 'string', description: 'Directory path' } },
          required: ['dir'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'read_file',
        description: 'Read a file',
        parameters: {
          type: 'object',
          properties: { path: { type: 'string', description: 'File path' } },
          required: ['path'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'write_file',
        description: 'Write to a file',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path' },
            content: { type: 'string', description: 'File content' },
          },
          required: ['path', 'content'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'create_file',
        description: 'Create a new file',
        parameters: {
          type: 'object',
          properties: { path: { type: 'string', description: 'File path' } },
          required: ['path'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'delete_entry',
        description: 'Delete a file or directory',
        parameters: {
          type: 'object',
          properties: { path: { type: 'string', description: 'Path to delete' } },
          required: ['path'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'apply_patch',
        description: 'Apply a unified diff to a file',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path' },
            diff: { type: 'string', description: 'Unified diff text' },
          },
          required: ['path', 'diff'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'run_command',
        description: 'Run a shell command in the project',
        parameters: {
          type: 'object',
          properties: {
            cmd: { type: 'string', description: 'Command' },
            args: { type: 'array', items: { type: 'string' }, description: 'Arguments' },
          },
          required: ['cmd'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'summarize_file',
        description: 'Generate a summary of a file',
        parameters: {
          type: 'object',
          properties: { path: { type: 'string', description: 'File path' } },
          required: ['path'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_summary',
        description: 'Retrieve a stored summary of a file',
        parameters: {
          type: 'object',
          properties: { path: { type: 'string', description: 'File path' } },
          required: ['path'],
        },
      },
    },
  ];

  async function handleToolCall(toolCall: any) {
    const { name, arguments: argString } = toolCall.function;
    const args = JSON.parse(argString ?? '{}');
    if (name === 'list_files') {
      const { dir } = args;
      const items = await listFiles(dir, backend);
      if (dir === projectRoot) setFiles(items);
      return JSON.stringify(items);
    }
    if (name === 'read_file') {
      const { path } = args;
      return await readFile(path, backend);
    }
    if (name === 'write_file') {
      const { path, content } = args;
      await writeFile(path, content, backend);
      return 'OK';
    }
    if (name === 'create_file') {
      const { path } = args;
      await createEntry(path, false, backend);
      return 'Created';
    }
    if (name === 'delete_entry') {
      const { path } = args;
      await deleteEntry(path, backend);
      return 'Deleted';
    }
    if (name === 'apply_patch') {
      const { path, diff } = args;
      await applyPatch(path, diff, backend);
      return 'Patch applied';
    }
    if (name === 'run_command') {
      const { cmd, args: cmdArgs = [] } = args;
      const res = await fetch('/api/local/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd, args: cmdArgs }),
      });
      const text = await res.text();
      return text;
    }
    if (name === 'summarize_file') {
      const { path } = args;
      const resp = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: path, modelId }),
      });
      const data = await resp.json();
      if (!data.ok) throw new Error(data.error);
      await saveSummary(path, data.summary);
      return data.summary;
    }
    if (name === 'get_summary') {
      const { path } = args;
      const sum = await getSummary(path);
      return sum ?? 'No summary';
    }
    return 'Unknown tool';
  }

  function adaptProviderResponse(data: any) {
    if (!data) throw new Error('Empty provider response');
    if (data.error) {
      if (typeof data.error === 'string') throw new Error(data.error);
      throw new Error(data.error.message ?? JSON.stringify(data.error));
    }
    if (Array.isArray(data.choices) && data.choices.length) {
      const choice = data.choices[0];
      return {
        message: choice.message ?? { role: 'assistant', content: choice.text ?? '' },
        usage: data.usage ?? choice.usage,
      };
    }
    if (typeof data.output_text === 'string') {
      return { message: { role: 'assistant', content: data.output_text }, usage: data.usage };
    }
    if (typeof data.output === 'string') {
      return { message: { role: 'assistant', content: data.output }, usage: data.usage };
    }
    if (typeof data.message === 'string') {
      return { message: { role: 'assistant', content: data.message }, usage: data.usage };
    }
    if (data.message?.content) {
      return { message: data.message, usage: data.usage };
    }
    if (data.content) {
      return { message: { role: 'assistant', content: data.content }, usage: data.usage };
    }
    return data;
  }

  async function callAI(messages: any[], allowTools = true) {
    const puter = getPuter();
    if (!puter) throw new Error('Puter not loaded');
    // If a provider is selected, call the custom provider route
    if (providerId) {
      const provider = providers.find((p) => p.id === providerId);
      if (!provider) throw new Error('Provider not found');
      const resp = await fetch(`/api/providers/${provider.id}?id=${provider.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, apiKey: provider.apiKey, apiUrl: provider.url }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Provider ${provider.label || provider.id} request failed`);
      }
      const data = await resp.json();
      return adaptProviderResponse(data);
    }
    // Otherwise call Puter AI, retrying without tools if unsupported
    const toolAttempts = allowTools ? [true, false] : [false];
    let lastError: any;
    for (const withTools of toolAttempts) {
      try {
        return await puter.ai.chat(messages, {
          model: modelId,
          tools: withTools ? tools : undefined,
          stream: false,
        });
      } catch (err) {
        lastError = err;
        if (!withTools) break;
      }
    }
    throw new Error((lastError as any)?.message || `Model ${modelId} is unavailable right now.`);
  }

  async function trackUsage(modelId: string, tokens: number, duration: number) {
    const puter = getPuter();
    if (!puter) return;
    try {
      const usage: { date: string; modelId: string; tokens: number; duration: number } = {
        date: new Date().toISOString(),
        modelId,
        tokens,
        duration,
      };
      const existing = (await puter.kv.get('analytics:token_usage')) || [];
      await puter.kv.set('analytics:token_usage', [...existing, usage]);
    } catch (err) {
      console.error('Failed to track usage', err);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setIsSending(true);
    setInput('');
    appendChat({ id: randomId(), role: 'user', content: text });
    const startTime = Date.now();
    try {
      let messages = buildMessages(text);
      let result = await callAI(messages);
      let totalTokens = result.usage?.total_tokens || 0;
      // Process tool calls iteratively
      while (result.message?.tool_calls?.length) {
        for (const tc of result.message.tool_calls) {
          const toolResult = await handleToolCall(tc);
          messages = [
            ...messages,
            result.message,
            { role: 'tool', tool_call_id: tc.id, content: normalizeContent(toolResult) },
          ];
          const nextResult = await callAI(messages);
          totalTokens += nextResult.usage?.total_tokens || 0;
          result = nextResult;
        }
      }
      const reply = normalizeContent(result.message?.content ?? '');
      const duration = Date.now() - startTime;
      appendChat({ id: randomId(), role: 'assistant', content: reply });
      await getPuter()?.kv.set('ultimate_coder_history', [...messages, { role: 'assistant', content: reply }]);
      // Track usage for analytics
      await trackUsage(modelId, totalTokens || 0, duration);
    } catch (err: any) {
      console.error(err);
      appendChat({
        id: randomId(),
        role: 'assistant',
        content: 'Error: ' + (err?.message || 'Unknown issue contacting the model.'),
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-2">
        {chat.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm font-medium text-foreground mb-1">Start a conversation</p>
            <p className="text-xs text-muted-foreground">Ask the AI to help with coding, refactoring, or file management</p>
          </div>
        ) : (
          chat.map((m) => (
            <div
              key={m.id}
              className={`rounded-lg px-3 py-2 border transition-all ${
                m.role === 'user'
                  ? 'bg-primary/10 border-primary/20 text-foreground ml-4'
                  : m.role === 'assistant'
                  ? 'bg-muted/50 border-border text-foreground mr-4'
                  : 'bg-muted/30 border-border text-muted-foreground'
              }`}
            >
              <div className="text-[10px] font-semibold uppercase mb-1.5 text-muted-foreground tracking-wider">
                {m.role === 'user' ? 'You' : m.role === 'assistant' ? 'AI Assistant' : 'System'}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={onSubmit} className="border-t border-border p-3 flex gap-2 bg-muted/20">
        <textarea
          rows={2}
          className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          placeholder="Ask the model to refactor, generate components, or manage files..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
