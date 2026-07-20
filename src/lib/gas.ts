// Server-only: current baseline gasoline price for Houston / Gulf Coast (PADD 3).
// Real data from the EIA v2 API when EIA_API_KEY is set; static fallback otherwise.
import { GAS_BASELINE_FALLBACK } from '@/lib/askEngine';

export interface GasBaseline {
  region: string;
  price: number;
  source: 'eia' | 'fallback';
  asOf: string;
}

let cache: { at: number; data: GasBaseline } | null = null;
const TTL_MS = 6 * 60 * 60 * 1000; // 6h — EIA is weekly

export async function getBaseline(): Promise<GasBaseline> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;

  const region = 'Houston (Gulf Coast)';
  const key = process.env.EIA_API_KEY;
  let data: GasBaseline = { region, price: GAS_BASELINE_FALLBACK, source: 'fallback', asOf: 'static baseline' };

  if (key) {
    try {
      // Gulf Coast (duoarea R30), regular gasoline (product EPMR), weekly retail price.
      const url =
        `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${key}` +
        `&frequency=weekly&data[0]=value&facets[duoarea][]=R30&facets[product][]=EPMR` +
        `&sort[0][column]=period&sort[0][direction]=desc&length=1`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const json = await res.json();
      const row = json?.response?.data?.[0];
      const val = row?.value != null ? Number(row.value) : NaN;
      if (Number.isFinite(val) && val > 0) {
        data = { region, price: +val.toFixed(2), source: 'eia', asOf: row.period ?? 'latest' };
      }
    } catch (err) {
      console.error('[gas] EIA fetch failed, using fallback:', err);
    }
  }

  cache = { at: Date.now(), data };
  return data;
}
