'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CameraIcon, XIcon } from './Icons';

interface Props {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

/** Full-screen camera modal. Streams getUserMedia and snaps a JPEG dataURL. */
export default function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1600 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        setError('Camera unavailable. Check permissions or use upload instead.');
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function snap() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL('image/jpeg', 0.86));
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-strong glass-hi relative w-full max-w-2xl overflow-hidden p-3"
        initial={{ scale: 0.94, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close camera"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/40 text-ink-soft transition hover:text-ink hover:border-white/30 cursor-pointer"
        >
          <XIcon width={18} height={18} />
        </button>

        {error ? (
          <div className="flex h-72 items-center justify-center px-8 text-center text-ink-soft">
            {error}
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="aspect-video w-full rounded-xl bg-black object-cover"
            />
            <div className="mt-3 flex items-center justify-center">
              <button
                onClick={snap}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet to-cyan px-6 py-3 font-display font-semibold text-base-800 shadow-glow-violet transition hover:brightness-110 active:scale-[0.97] cursor-pointer"
              >
                <CameraIcon width={18} height={18} /> Capture sketch
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
