# Blueprint — Technical LinkedIn Post

## Version: Professional/Technical (No Emojis)

---

Introducing Blueprint: photograph a hand-drawn UI wireframe and watch a local vision model rebuild it as a live, modern HTML and Tailwind mockup, streaming token-by-token in front of you.

The idea is simple but the experience is the point. You sketch a layout on paper, drop the photo in, and the generated interface assembles itself in a live preview with no page reloads. Copy the HTML, download a standalone file, or refine the result in plain English.

How it works:

1. Capture and prepare
   - Drag-drop, file upload, device camera, or a built-in demo sketch
   - The image is downscaled client-side to roughly 1200px before inference, which is the single biggest speed win on the input side

2. Single-pass streaming vision
   - A Next.js route handler calls Ollama running gemma4:12b (vision) with streaming enabled
   - The model emits only Tailwind-styled body markup, which streams straight to the screen as it is generated
   - Because gemma4 is a thinking model, reasoning is disabled so the tokens that stream are the actual UI, not hidden deliberation

3. Flash-free live preview
   - The preview iframe loads its runtime exactly once, then HTML is streamed into it via postMessage and injected as innerHTML
   - The result builds progressively with no reload flicker
   - Safe by construction: model output is injected into a script-sandboxed iframe with no same-origin access, so any script the model emits never executes and cannot reach the parent page

4. Refine loop
   - A natural-language instruction plus the current markup regenerates the UI

Technical stack:
- Framework: Next.js 14 (App Router) with TypeScript
- Vision model: Ollama gemma4:12b, local inference, kept warm with keep_alive
- Streaming: route handler transforms Ollama NDJSON into a token text stream; the client coalesces updates on requestAnimationFrame for a 60fps build
- UI: Tailwind CSS and Framer Motion; a cinematic near-black cockpit with warm-amber and cool steel-blue accents, fine dot-grid texture, and hairline glass
- Privacy: fully local, no cloud, no API keys; the sketch never leaves the machine

Blueprint is part of an ongoing series of local-first AI applications built on Ollama.

Learn more: github.com/Nanthu-FS/Blueprint

#LocalAI #VisionModels #Ollama #NextJS #Tailwind #FrontendEngineering #OpenSource #PrivacyFirst
