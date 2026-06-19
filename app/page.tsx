'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Background from '@/components/Background';
import BrandBar from '@/components/BrandBar';
import CaptureZone, { type HistoryItem } from '@/components/CaptureZone';
import LivePreview from '@/components/LivePreview';
import CodePanel from '@/components/CodePanel';
import { useOllamaStream } from '@/hooks/useOllamaStream';
import type { PreparedImage } from '@/lib/image';
import { XIcon } from '@/components/Icons';

export default function Home() {
  const [selected, setSelected] = useState<PreparedImage | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { status, html, error, elapsed, run, stop, reset } = useOllamaStream();

  const generating = status === 'generating';

  const onPicked = useCallback(
    (image: PreparedImage) => {
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `s-${history.length}-${image.base64.slice(0, 6)}`;
      setSelected(image);
      setActiveId(id);
      setHistory((h) => [{ id, image }, ...h].slice(0, 9));
      reset();
    },
    [history.length, reset],
  );

  const onSelectHistory = useCallback(
    (item: HistoryItem) => {
      setSelected(item.image);
      setActiveId(item.id);
      reset();
    },
    [reset],
  );

  const onGenerate = useCallback(() => {
    if (selected) run({ image: selected.base64 });
  }, [selected, run]);

  const onRefine = useCallback(
    (instruction: string) => {
      if (html.trim()) run({ instruction, currentHtml: html });
    },
    [html, run],
  );

  return (
    <div className="relative flex h-[100dvh] max-h-[100dvh] flex-col gap-4 overflow-hidden p-4 lg:p-5">
      <Background />

      <BrandBar canGenerate={!!selected} generating={generating} onGenerate={onGenerate} />

      <main className="grid min-h-0 flex-1 gap-4 overflow-y-auto lg:grid-cols-[19rem_1fr_23rem] lg:overflow-hidden">
        {/* Left rail: capture + history */}
        <section className="order-2 min-h-[22rem] lg:order-1 lg:min-h-0">
          <CaptureZone
            history={history}
            activeId={activeId}
            onPicked={onPicked}
            onSelectHistory={onSelectHistory}
            busy={generating}
          />
        </section>

        {/* Center stage: live preview */}
        <section className="order-1 min-h-[55vh] lg:order-2 lg:min-h-0">
          <LivePreview html={html} status={status} />
        </section>

        {/* Right inspector: code + refine */}
        <section className="order-3 min-h-[40vh] lg:min-h-0">
          <CodePanel html={html} status={status} elapsed={elapsed} onRefine={onRefine} onStop={stop} />
        </section>
      </main>

      {/* Error toast */}
      <AnimatePresence>
        {status === 'error' && error && (
          <motion.div
            role="alert"
            aria-live="assertive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-0 bottom-5 z-50 mx-auto flex w-fit max-w-[90vw] items-start gap-3 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-ink backdrop-blur-xl"
          >
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-danger" />
            <p className="max-w-md break-words">{error}</p>
            <button onClick={reset} aria-label="Dismiss" className="text-ink-faint hover:text-ink cursor-pointer">
              <XIcon width={16} height={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
