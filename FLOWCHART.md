# Blueprint — Sketch → Live UI Flowchart

```
┌──────────────────────────────────────────────────────────────────┐
│                  Blueprint  ·  Data Flow                          │
└──────────────────────────────────────────────────────────────────┘

                          USER INTERFACE
                              │
                 drop · upload · camera · demo
                              │
                  ┌───────────▼───────────┐
                  │ CaptureZone           │
                  │ (components/)         │
                  └───────────┬───────────┘
                              │ File
                  ┌───────────▼───────────┐
                  │ Downscale to ~1200px  │
                  │ canvas → base64 JPEG  │
                  │ (lib/image.ts)        │
                  └───────────┬───────────┘
                              │ base64
                  ┌───────────▼────────────────────┐
                  │ POST /api/generate              │
                  │ build prompt (lib/prompt.ts)    │
                  │ + image                         │
                  └───────────┬────────────────────┘
                              │
                  ┌───────────▼────────────────────┐
                  │ Ollama  gemma4:12b  (VISION)    │
                  │ stream:true · think:false       │
                  │ keep_alive:30m (lib/ollama.ts)  │
                  └───────────┬────────────────────┘
                              │ NDJSON tokens
                  ┌───────────▼────────────────────┐
                  │ Route transform → ReadableStream│
                  │ raw HTML text (SSE-style)       │
                  └───────────┬────────────────────┘
                              │ chunks
                  ┌───────────▼────────────────────┐
                  │ useOllamaStream (client)        │
                  │ cleanBodyHtml() · rAF-coalesced │
                  └───────┬───────────────┬─────────┘
                          │               │
              ┌───────────▼──────┐  ┌─────▼────────────────────┐
              │ CodePanel        │  │ LivePreview iframe        │
              │ live monospace   │  │ postMessage('bp:html')    │
              │ copy · .html     │  │ → innerHTML injection     │
              └──────────────────┘  │ sandbox="allow-scripts"   │
                                    │ (no allow-same-origin)    │
                                    └─────┬────────────────────┘
                                          │
                              ┌───────────▼───────────┐
                              │ Tailwind Play CDN      │
                              │ (async) styles it →    │
                              │ LIVE render, no reload │
                              └───────────┬───────────┘
                                          │
                              ┌───────────▼───────────┐
                              │ Refine loop:           │
                              │ instruction + current  │
                              │ HTML → regenerate      │
                              └───────────────────────┘


┌──────────────────────────────────────────────────────┐
│           ARCHITECTURE                               │
├──────────────────────────────────────────────────────┤
│  Next.js 14 (App Router) + TypeScript + Tailwind     │
│                                                      │
│  app/                                                │
│    page.tsx                cockpit orchestration     │
│    api/generate/route.ts   stream proxy → Ollama     │
│    api/health/route.ts     model status probe        │
│                                                      │
│  components/                                         │
│    BrandBar · CaptureZone · CameraCapture            │
│    LivePreview (sandboxed iframe) · CodePanel        │
│    Background · Icons (inline SVG, no emoji)         │
│                                                      │
│  hooks/useOllamaStream.ts  streaming + rAF coalesce  │
│  lib/  ollama · prompt · image · html · demoSketch   │
│                                                      │
│  Model: Ollama gemma4:12b (local vision inference)   │
└──────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────┐
│           KEY DESIGN DECISIONS                       │
├──────────────────────────────────────────────────────┤
│ Single-pass streaming   image → HTML directly, so    │
│                         the UI builds token-by-token │
│                                                      │
│ Flash-free preview      iframe loads its runtime     │
│                         ONCE; HTML streamed in via    │
│                         postMessage — never reloads   │
│                                                      │
│ Safe by construction    model output is innerHTML    │
│                         inside a script-sandboxed     │
│                         iframe; emitted <script>      │
│                         never executes                │
│                                                      │
│ think:false             gemma4 is a thinking model;   │
│                         disabled so tokens stream as  │
│                         HTML, not hidden reasoning    │
│                                                      │
│ Fully local             no cloud, no API keys; the    │
│                         sketch never leaves the box   │
└──────────────────────────────────────────────────────┘
```

## Pipeline summary

1. **Capture** — drop / upload / camera / demo sketch → downscale to ~1200px (`lib/image.ts`).
2. **Generate** — `POST /api/generate` builds the vision prompt + image and calls Ollama `gemma4:12b` with `stream:true`, `think:false`.
3. **Stream** — the route transforms Ollama's NDJSON into a raw-HTML text stream; `useOllamaStream` reads it and coalesces updates on `requestAnimationFrame`.
4. **Render** — HTML streams into the code panel and, via `postMessage`, into a once-loaded sandboxed iframe that Tailwind styles live — no reload flicker.
5. **Refine** — a natural-language instruction plus the current HTML regenerates the UI.
