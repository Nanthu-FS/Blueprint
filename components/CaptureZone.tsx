'use client';

import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { prepareImage, fromDataUrl, type PreparedImage } from '@/lib/image';
import { demoSketchFile } from '@/lib/demoSketch';
import CameraCapture from './CameraCapture';
import { UploadIcon, CameraIcon, SparkIcon, BoltIcon, ImageIcon } from './Icons';

export interface HistoryItem {
  id: string;
  image: PreparedImage;
}

interface Props {
  history: HistoryItem[];
  activeId: string | null;
  onPicked: (image: PreparedImage) => void;
  onSelectHistory: (item: HistoryItem) => void;
  busy: boolean;
}

export default function CaptureZone({ history, activeId, onPicked, onSelectHistory, busy }: Props) {
  const [dragging, setDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setLoading(true);
      try {
        const img = await prepareImage(file);
        onPicked(img);
      } catch {
        /* ignore bad files */
      } finally {
        setLoading(false);
      }
    },
    [onPicked],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Drop zone */}
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        animate={{
          borderColor: dragging ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.1)',
          scale: dragging ? 1.01 : 1,
        }}
        className="glass-hi relative flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-white/[0.03] p-6 text-center"
      >
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet/30 to-cyan/20 text-violet-bright shadow-glow-violet">
          {loading ? (
            <SparkIcon className="animate-spin" />
          ) : (
            <UploadIcon width={24} height={24} />
          )}
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-ink">Drop a sketch</p>
          <p className="mt-0.5 text-xs text-ink-faint">or use a button below</p>
        </div>

        <div className="mt-1 grid w-full grid-cols-2 gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-ink transition hover:border-white/25 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
          >
            <UploadIcon width={15} height={15} /> Upload
          </button>
          <button
            onClick={() => setShowCamera(true)}
            disabled={busy}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-ink transition hover:border-white/25 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
          >
            <CameraIcon width={15} height={15} /> Camera
          </button>
        </div>

        <button
          onClick={() => handleFile(demoSketchFile())}
          disabled={busy}
          className="group inline-flex items-center gap-1.5 text-xs font-medium text-cyan transition hover:text-cyan-bright disabled:opacity-40 cursor-pointer"
        >
          <BoltIcon width={14} height={14} className="transition group-hover:scale-110" />
          Try a demo sketch
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
      </motion.div>

      {/* History */}
      <div className="shrink-0">
        <div className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
          <ImageIcon width={13} height={13} /> Recent sketches
        </div>
        {history.length === 0 ? (
          <p className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-4 text-center text-xs text-ink-faint">
            Your captures appear here
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectHistory(item)}
                className={`group relative aspect-square overflow-hidden rounded-xl border transition cursor-pointer ${
                  item.id === activeId
                    ? 'border-violet shadow-glow-violet'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image.dataUrl}
                  alt="sketch thumbnail"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCamera && (
          <CameraCapture
            onClose={() => setShowCamera(false)}
            onCapture={(dataUrl) => {
              setShowCamera(false);
              onPicked(fromDataUrl(dataUrl));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
