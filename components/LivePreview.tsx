'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MonitorIcon, TabletIcon, PhoneIcon, SparkIcon } from './Icons'; // accent: amber/steel
import type { GenStatus } from '@/hooks/useOllamaStream';

// The iframe loads this ONCE. Tailwind's runtime + a message listener live here;
// the parent streams body HTML in via postMessage so there is never a reload.
const BOOTSTRAP = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<!-- async so it never parser-blocks the inline listener below; Tailwind Play
     scans existing DOM on init, so injecting markup before it loads is fine. -->
<script async src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"/>
<style>
  html,body{margin:0;padding:0}
  body{font-family:'Inter',system-ui,sans-serif;background:#ffffff;color:#0f172a}
  ::-webkit-scrollbar{width:10px;height:10px}
  ::-webkit-scrollbar-thumb{background:rgba(0,0,0,.18);border-radius:9px}
</style>
</head>
<body>
<div id="bp-root"></div>
<script>
  var root=document.getElementById('bp-root');
  window.addEventListener('message',function(e){
    if(e.data&&e.data.type==='bp:html'){root.innerHTML=e.data.html;}
  });
  parent.postMessage({type:'bp:ready'},'*');
</script>
</body>
</html>`;

const DEVICES = {
  desktop: { label: 'Desktop', w: 1280, Icon: MonitorIcon },
  tablet: { label: 'Tablet', w: 834, Icon: TabletIcon },
  mobile: { label: 'Mobile', w: 390, Icon: PhoneIcon },
} as const;
type DeviceKey = keyof typeof DEVICES;

export default function LivePreview({ html, status }: { html: string; status: GenStatus }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const htmlRef = useRef(html);
  const readyRef = useRef(false);
  const [device, setDevice] = useState<DeviceKey>('desktop');

  htmlRef.current = html;

  function post(h: string) {
    iframeRef.current?.contentWindow?.postMessage({ type: 'bp:html', html: h }, '*');
  }

  // Handshake. The iframe's inline 'bp:ready' message can fire before this
  // listener attaches (race -> blank preview), so the iframe's onLoad below is
  // the primary trigger; this message handler is just a backup.
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data?.type === 'bp:ready') {
        readyRef.current = true;
        post(htmlRef.current);
      }
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  function handleLoad() {
    readyRef.current = true;
    post(htmlRef.current);
  }

  // Stream every html update into the already-loaded iframe.
  useEffect(() => {
    if (readyRef.current) post(html);
  }, [html]);

  const hasContent = html.trim().length > 0;
  const generating = status === 'generating';
  const width = DEVICES[device].w;

  return (
    <div className="flex h-full flex-col">
      {/* Device toolbar */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
          {(Object.keys(DEVICES) as DeviceKey[]).map((key) => {
            const { label, Icon } = DEVICES[key];
            const active = key === device;
            return (
              <button
                key={key}
                onClick={() => setDevice(key)}
                aria-label={label}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                  active ? 'bg-white/10 text-ink shadow-glow-amber' : 'text-ink-faint hover:text-ink'
                }`}
              >
                <Icon width={15} height={15} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3 py-1.5 text-xs font-medium text-amber-bright"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-bright" />
              </span>
              Building live
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stage */}
      <div className="glass glass-hi relative flex flex-1 items-stretch justify-center overflow-hidden p-3 sm:p-5">
        {/* top progress shimmer */}
        {generating && (
          <div className="absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden">
            <div className="h-full w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-amber-bright to-transparent" />
          </div>
        )}

        <motion.div
          animate={{ width: device === 'desktop' ? '100%' : width }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          style={{ maxWidth: '100%' }}
          className="relative h-full overflow-hidden rounded-xl border border-white/10 bg-white shadow-2xl shadow-black/40"
        >
          <iframe
            ref={iframeRef}
            title="Live preview"
            sandbox="allow-scripts"
            srcDoc={BOOTSTRAP}
            onLoad={handleLoad}
            className="h-full w-full"
            style={{ opacity: hasContent ? 1 : 0, transition: 'opacity 220ms ease' }}
          />

          {/* Empty / skeleton overlay */}
          <AnimatePresence>
            {!hasContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 grid place-items-center overflow-hidden bg-base-800 px-6 text-center"
              >
                {/* crafted backdrop: subtle warm pool + dot texture over solid dark */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(238,155,91,0.10),transparent_52%)]" />
                <div className="dotgrid absolute inset-0 opacity-[0.04]" />
                {generating ? (
                  <div className="relative flex flex-col items-center gap-4">
                    <SparkIcon className="h-8 w-8 animate-spin text-amber-bright neon-amber" />
                    <p className="font-display text-sm text-ink-soft">Reading your sketch…</p>
                  </div>
                ) : (
                  <div className="relative flex max-w-xs flex-col items-center gap-3">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-amber-bright shadow-glow-amber">
                      <SparkIcon className="h-7 w-7" />
                    </div>
                    <p className="font-display text-lg font-semibold text-gradient">
                      Your UI materializes here
                    </p>
                    <p className="text-sm text-ink-faint">
                      Drop a hand-drawn sketch and watch it build itself, live.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
