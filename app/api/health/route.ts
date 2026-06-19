import { ollamaStatus } from '@/lib/ollama';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Lightweight status probe for the model-status pill in the top bar. */
export async function GET() {
  const status = await ollamaStatus();
  return Response.json(status, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
