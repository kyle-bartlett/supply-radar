// Server-only: picks the newest stable Haiku from Anthropic's live model catalog,
// so a model upgrade needs no code change. Order: ANTHROPIC_MODEL pin > catalog > fallback.
import type Anthropic from '@anthropic-ai/sdk';

const STABLE_HAIKU = /^claude-haiku-(\d{1,2})(?:-(\d{1,2}))?$/; // skips dated snapshots and previews
const FALLBACK = 'claude-haiku-4-5'; // used only until the catalog has answered once
const TTL_MS = 6 * 60 * 60 * 1000;

let cache: { at: number; id: string } | null = null;

export async function resolveModel(client: Anthropic): Promise<string> {
  if (process.env.ANTHROPIC_MODEL) return process.env.ANTHROPIC_MODEL;
  if (cache && Date.now() - cache.at < TTL_MS) return cache.id;

  try {
    let best: { id: string; v: [number, number] } | null = null;
    for await (const m of client.models.list({ limit: 1000 })) {
      const hit = STABLE_HAIKU.exec(m.id);
      if (!hit) continue;
      const v: [number, number] = [Number(hit[1]), Number(hit[2] ?? 0)];
      if (!best || v[0] > best.v[0] || (v[0] === best.v[0] && v[1] > best.v[1])) best = { id: m.id, v };
    }
    if (best) cache = { at: Date.now(), id: best.id };
  } catch {
    // Catalog unreachable: keep the last good id, or fall back below. Retry on the next request.
  }
  return cache?.id ?? FALLBACK;
}
