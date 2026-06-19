'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SparkIcon, BoltIcon } from './Icons';

interface Health {
  up: boolean;
  model: string;
  modelReady: boolean;
}

interface Props {
  canGenerate: boolean;
  generating: boolean;
  onGenerate: () => void;
}

export default function BrandBar({ canGenerate, generating, onGenerate }: Props) {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    let alive = true;
    const probe = async () => {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        const data = (await res.json()) as Health;
        if (alive) setHealth(data);
      } catch {
        if (alive) setHealth({ up: false, model: 'gemma4:12b', modelReady: false });
      }
    };
    probe();
    const id = setInterval(probe, 8000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const pill = !health
    ? { dot: 'bg-ink-faint', text: 'Checking model…', glow: '' }
    : !health.up
      ? { dot: 'bg-danger', text: 'Ollama offline', glow: '' }
      : !health.modelReady
        ? { dot: 'bg-amber-400', text: `${health.model} missing`, glow: '' }
        : { dot: 'bg-ok', text: `${health.model} ready`, glow: 'shadow-glow-cyan' };

  return (
    <header className="flex items-center justify-between gap-4 px-1 py-1">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet to-cyan text-base-800 shadow-glow-violet">
          <SparkIcon width={22} height={22} />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold leading-none text-ink">
            Blue<span className="text-gradient">print</span>
          </h1>
          <p className="mt-0.5 text-[11px] text-ink-faint">sketch → live UI, locally</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-ink-soft sm:flex ${pill.glow}`}
        >
          <span className={`h-2 w-2 rounded-full ${pill.dot} animate-pulse-glow`} />
          <span className="font-mono">{pill.text}</span>
        </div>

        <motion.button
          onClick={onGenerate}
          disabled={!canGenerate || generating}
          whileTap={{ scale: 0.96 }}
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet via-violet-bright to-cyan px-5 py-2.5 font-display text-sm font-semibold text-base-800 shadow-glow-violet transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none cursor-pointer"
        >
          {generating ? (
            <>
              <SparkIcon width={17} height={17} className="animate-spin" /> Generating…
            </>
          ) : (
            <>
              <BoltIcon width={17} height={17} className="transition group-hover:scale-110" />
              Generate
            </>
          )}
        </motion.button>
      </div>
    </header>
  );
}
