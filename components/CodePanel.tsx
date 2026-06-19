'use client';

import { useEffect, useRef, useState } from 'react';
import { wrapDocument } from '@/lib/html';
import { CopyIcon, CheckIcon, DownloadIcon, WandIcon, StopIcon } from './Icons';
import type { GenStatus } from '@/hooks/useOllamaStream';

interface Props {
  html: string;
  status: GenStatus;
  elapsed: number;
  onRefine: (instruction: string) => void;
  onStop: () => void;
}

export default function CodePanel({ html, status, elapsed, onRefine, onStop }: Props) {
  const [copied, setCopied] = useState(false);
  const [refine, setRefine] = useState('');
  const codeRef = useRef<HTMLPreElement>(null);

  const generating = status === 'generating';
  const hasContent = html.trim().length > 0;

  // Auto-scroll the code view as tokens stream in.
  useEffect(() => {
    if (generating && codeRef.current) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight;
    }
  }, [html, generating]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(wrapDocument(html));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  }

  function download() {
    const blob = new Blob([wrapDocument(html)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blueprint.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  function submitRefine(e: React.FormEvent) {
    e.preventDefault();
    const v = refine.trim();
    if (!v || generating) return;
    onRefine(v);
    setRefine('');
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-semibold text-ink">Code</span>
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
            HTML · Tailwind
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {generating ? (
            <button
              onClick={onStop}
              className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-2.5 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/20 cursor-pointer"
            >
              <StopIcon width={14} height={14} /> Stop
            </button>
          ) : (
            <>
              <button
                onClick={copy}
                disabled={!hasContent}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-ink transition hover:border-white/25 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
              >
                {copied ? (
                  <CheckIcon width={14} height={14} className="text-ok" />
                ) : (
                  <CopyIcon width={14} height={14} />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={download}
                disabled={!hasContent}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-ink transition hover:border-white/25 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
              >
                <DownloadIcon width={14} height={14} /> .html
              </button>
            </>
          )}
        </div>
      </div>

      {/* Code stream */}
      <div className="glass glass-hi relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <pre
          ref={codeRef}
          className="flex-1 overflow-auto p-4 font-mono text-[12px] leading-relaxed text-ink-soft"
        >
          <code className="whitespace-pre-wrap break-words">
            {hasContent ? html : ''}
            {generating && <span className="ml-0.5 inline-block w-2 animate-caret text-violet-bright">▌</span>}
            {!hasContent && !generating && (
              <span className="text-ink-faint">{'<!-- generated markup will stream here -->'}</span>
            )}
          </code>
        </pre>
        <div className="flex items-center justify-between border-t border-white/5 px-4 py-2 font-mono text-[10px] text-ink-faint">
          <span>{(html.length / 1000).toFixed(1)}k chars</span>
          <span>{(elapsed / 1000).toFixed(1)}s</span>
        </div>
      </div>

      {/* Refine */}
      <form onSubmit={submitRefine} className="mt-3 shrink-0">
        <label htmlFor="refine" className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
          <WandIcon width={13} height={13} /> Refine
        </label>
        <div className="flex items-center gap-2">
          <input
            id="refine"
            value={refine}
            onChange={(e) => setRefine(e.target.value)}
            disabled={!hasContent || generating}
            placeholder="make the header dark, add a footer…"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition focus:border-violet/60 focus:shadow-glow-violet disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!hasContent || generating || !refine.trim()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet to-cyan px-3.5 py-2.5 text-sm font-semibold text-base-800 shadow-glow-violet transition hover:brightness-110 active:scale-[0.97] disabled:opacity-40 disabled:shadow-none cursor-pointer"
          >
            <WandIcon width={16} height={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
