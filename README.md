# Blueprint

**Photograph a hand-drawn UI sketch and watch a local vision model stream it into a live, modern HTML/Tailwind mockup.** Fully local. No cloud, no API keys.

Blueprint reads your wireframe — boxes, labels, arrows, squiggles — and rebuilds it as a real, responsive web page, rendering **live, token-by-token, with no reload flicker**. Copy the HTML, download it, or refine it in plain English.

![Blueprint](docs/preview.png)

---

## How it works

```
sketch photo ──► downscale (canvas) ──► /api/generate ──► Ollama vision (stream)
                                                                │  tokens
   live code panel ◄──────────────── useOllamaStream ◄─────────┘
   live iframe preview ◄── postMessage(html) ── (iframe loads Tailwind ONCE)
```

- **One-pass streaming.** The model emits only Tailwind-styled body markup and it streams straight to the screen.
- **Flash-free live preview.** The preview iframe loads its runtime (Tailwind Play CDN + a message listener) exactly once. The app then streams HTML into it via `postMessage`, so the UI *builds itself* without ever reloading.
- **Safe by construction.** Model output is injected as `innerHTML` inside a `sandbox="allow-scripts"` iframe (no `allow-same-origin`), so any `<script>` the model emits never executes and it can't touch the parent page.
- **Refine loop.** Type "make the header dark, add a footer" and Blueprint regenerates with your change.

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Framer Motion** for the cockpit micro-animations
- **Ollama** running `gemma4:12b` (vision) locally
- Design system synthesized via `ui-ux-pro-max` (OLED-dark glassmorphism, violet/cyan neon, Space Grotesk + Inter + JetBrains Mono)

## Prerequisites

1. [Ollama](https://ollama.com) running locally.
2. The vision model pulled:
   ```bash
   ollama pull gemma4:12b
   ```

## Run

```bash
npm install
npm run dev
# open http://localhost:3016
```

Optional config — copy `.env.local.example` to `.env.local` to point at a different Ollama URL or model.

## Notes

- First generation warms the model; subsequent runs are snappier (the client keeps it warm with `keep_alive`).
- Downscaling the sketch to ~1200px before sending is the biggest input-side speed win.
- **Verify the live preview in a real browser** (Chrome/Edge/Firefox). Some embedded preview environments have a disabled `ResizeObserver`, which can break iframe auto-sizing.

---

Built locally with Ollama. Part of an ongoing series of local-first AI apps.
