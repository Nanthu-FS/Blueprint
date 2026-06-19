import { NextRequest } from 'next/server';
import { streamGenerate } from '@/lib/ollama';
import { SYSTEM_PROMPT, buildGeneratePrompt, buildRefinePrompt } from '@/lib/prompt';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface Body {
  image?: string; // base64 (data: prefix optional) - required for first pass
  instruction?: string; // refine note
  currentHtml?: string; // existing markup to refine
}

/**
 * Streams the vision model's HTML output token-by-token as plain text.
 * The client reads this with a ReadableStream reader and feeds the live
 * preview iframe + code panel.
 */
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  const isRefine = Boolean(body.instruction && body.currentHtml);
  if (!isRefine && !body.image) {
    return new Response('Missing image', { status: 400 });
  }

  const images = body.image
    ? [body.image.includes(',') ? body.image.split(',')[1] : body.image]
    : undefined;

  const prompt = isRefine
    ? buildRefinePrompt(body.currentHtml!, body.instruction!)
    : buildGeneratePrompt();

  let upstream: Response;
  try {
    upstream = await streamGenerate({
      system: SYSTEM_PROMPT,
      prompt,
      images,
      temperature: isRefine ? 0.3 : 0.45,
      signal: req.signal,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const hint = /fetch failed|ECONNREFUSED/i.test(msg)
      ? ' (Is Ollama running and is gemma4:12b pulled? Try: ollama pull gemma4:12b)'
      : '';
    return new Response(`__ERROR__Vision model failed: ${msg}${hint}`, {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // Transform Ollama's NDJSON stream into a stream of raw token text.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Ollama emits newline-delimited JSON objects.
          let nl: number;
          while ((nl = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            if (!line) continue;
            try {
              const obj = JSON.parse(line) as { response?: string; done?: boolean };
              if (obj.response) controller.enqueue(encoder.encode(obj.response));
            } catch {
              /* skip partial/non-JSON lines */
            }
          }
        }
      } catch (err) {
        if (!(err instanceof Error && err.name === 'AbortError')) {
          controller.enqueue(encoder.encode(`\n__ERROR__${String(err)}`));
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
    cancel() {
      upstream.body?.cancel().catch(() => {});
    },
  });

  return new Response(out, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
