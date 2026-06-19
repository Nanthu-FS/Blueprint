// Thin streaming Ollama client for Blueprint.
// Reuses the pattern from pill_id/lib/ollama.ts but streams tokens instead of
// forcing JSON, because we want to watch the UI build live.

// Use the IPv4 literal, not "localhost": Node's fetch can try IPv6 (::1) first
// and intermittently fail when Ollama only binds 127.0.0.1.
const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434';
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'gemma4:12b';

export interface StreamOpts {
  prompt: string;
  system?: string;
  images?: string[]; // base64, WITHOUT the data: URL prefix
  temperature?: number;
  signal?: AbortSignal;
}

/**
 * Call the vision model via /api/generate with stream:true.
 * Returns the raw fetch Response whose body is Ollama's NDJSON stream
 * ({"response":"<token>","done":false}\n ...). The caller transforms it.
 */
export async function streamGenerate(opts: StreamOpts): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: opts.signal,
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: opts.prompt,
      system: opts.system,
      images: opts.images,
      stream: true,
      think: false, // gemma4 is a thinking model; disable so tokens stream as HTML, not hidden reasoning
      keep_alive: '30m', // keep the model warm between requests (snappiness)
      options: {
        temperature: opts.temperature ?? 0.4,
        num_ctx: 8192,
        num_predict: 3072,
        top_p: 0.9,
      },
    }),
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    const cause = (err as { cause?: { code?: string } })?.cause;
    const detail = cause?.code ? ` (${cause.code})` : '';
    throw new Error(`Could not reach Ollama at ${OLLAMA_URL}${detail}. Is it running?`);
  }

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama ${res.status}: ${text || res.statusText}`);
  }
  return res;
}

/** Is the Ollama daemon reachable, and is our vision model pulled? */
export async function ollamaStatus(): Promise<{ up: boolean; model: string; modelReady: boolean }> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { cache: 'no-store' });
    if (!res.ok) return { up: false, model: OLLAMA_MODEL, modelReady: false };
    const data = (await res.json()) as { models?: Array<{ name?: string }> };
    const names = (data.models ?? []).map((m) => m.name ?? '');
    const modelReady = names.some((n) => n === OLLAMA_MODEL || n.startsWith(OLLAMA_MODEL.split(':')[0]));
    return { up: true, model: OLLAMA_MODEL, modelReady };
  } catch {
    return { up: false, model: OLLAMA_MODEL, modelReady: false };
  }
}

/** Pre-warm the model so the first real generation is fast. Fire-and-forget. */
export async function warm(): Promise<void> {
  try {
    await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt: '', think: false, keep_alive: '30m', stream: false }),
    });
  } catch {
    /* best effort */
  }
}
