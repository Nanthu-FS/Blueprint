'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cleanBodyHtml } from '@/lib/html';

export type GenStatus = 'idle' | 'generating' | 'done' | 'error';

export interface RunArgs {
  image?: string; // base64
  instruction?: string; // refine note
  currentHtml?: string; // existing markup to refine
}

/**
 * Drives a streaming generation: POSTs to /api/generate, reads the token
 * stream, and exposes the live (cleaned) HTML. Updates are coalesced on
 * requestAnimationFrame so the preview + code panel stay at 60fps.
 */
export function useOllamaStream() {
  const [status, setStatus] = useState<GenStatus>('idle');
  const [html, setHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const rawRef = useRef('');
  const abortRef = useRef<AbortController | null>(null);
  const rafRef = useRef<number | null>(null);

  const flush = useCallback(() => {
    rafRef.current = null;
    setHtml(cleanBodyHtml(rawRef.current));
  }, []);

  const scheduleFlush = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(flush);
  }, [flush]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    stop();
    rawRef.current = '';
    setHtml('');
    setError(null);
    setStatus('idle');
    setElapsed(0);
  }, [stop]);

  const run = useCallback(
    async (args: RunArgs) => {
      stop();
      const ac = new AbortController();
      abortRef.current = ac;
      rawRef.current = '';
      setHtml('');
      setError(null);
      setStatus('generating');

      const startedAt = performance.now();
      const timer = setInterval(() => setElapsed(performance.now() - startedAt), 100);

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args),
          signal: ac.signal,
        });
        if (!res.ok || !res.body) {
          const t = await res.text().catch(() => res.statusText);
          throw new Error(t.replace('__ERROR__', '') || `HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk.includes('__ERROR__')) {
            throw new Error(chunk.split('__ERROR__')[1] || 'stream error');
          }
          rawRef.current += chunk;
          scheduleFlush();
        }

        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        setHtml(cleanBodyHtml(rawRef.current));
        setStatus('done');
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          setStatus(rawRef.current ? 'done' : 'idle');
        } else {
          setError(e instanceof Error ? e.message : String(e));
          setStatus('error');
        }
      } finally {
        clearInterval(timer);
        setElapsed(performance.now() - startedAt);
      }
    },
    [scheduleFlush, stop],
  );

  useEffect(() => () => stop(), [stop]);

  return { status, html, error, elapsed, run, stop, reset };
}
