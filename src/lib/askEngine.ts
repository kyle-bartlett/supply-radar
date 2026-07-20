// Ask-engine: powers the "Ask Anything" bar.
// Works with NO API key (deterministic heuristic) and gets richer when Claude
// is wired in via /api/ask. Shared types live here so client + server agree.

import { ports, shipments, suppliers, kpiHistory, alerts, nlQueries } from '@/data/demo';

export interface FuelImpact {
  region: string;
  baselineUsd: number;
  projectedUsd: number;
  deltaUsd: number;
  deltaPct: number;
  rationale: string;
  estimated: true; // always an illustrative model, never a real forecast
}

export interface ScenarioImpact {
  title: string;
  summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskDelta: number; // percentage points added to overall risk
  epicenter: { lat: number; lng: number; label: string };
  affectedPortIds: string[];
  affectedShipmentIds: string[];
  fuelImpact?: FuelImpact | null;
}

// Static fallback baseline (Houston / Gulf Coast regular) when EIA is unavailable.
export const GAS_BASELINE_FALLBACK = 2.9;

// Deterministic, illustrative pump-price impact model. NOT a forecast.
// Amplifies for energy chokepoints (Hormuz/Suez), Gulf-refining weather, and war.
export function estimateFuelImpact(opts: { baseline: number; severity: string; text: string; region?: string }): FuelImpact {
  const t = opts.text.toLowerCase();
  let pct = opts.severity === 'high' || opts.severity === 'critical' ? 0.03 : opts.severity === 'medium' ? 0.015 : 0.006;

  if (/(strait|hormuz|suez|panama|oil|crude|opec|refiner|refining|energy|war|blockade|pipeline|tanker)/.test(t)) pct += 0.05;
  if (
    /(hurricane|typhoon|tropical storm|storm|flood).*(gulf|houston|texas|louisiana)/.test(t) ||
    /(gulf|houston|texas|louisiana).*(hurricane|typhoon|tropical storm|storm|flood)/.test(t)
  ) pct += 0.06; // Gulf Coast refining exposure
  if (/(tariff|customs|duty)/.test(t)) pct = Math.max(pct, 0.008); // tariffs less direct at the pump

  pct = Math.min(pct, 0.18); // cap at +18%
  const baseline = +opts.baseline.toFixed(2);
  const projected = +(baseline * (1 + pct)).toFixed(2);
  const region = opts.region || 'Houston (Gulf Coast)';
  return {
    region,
    baselineUsd: baseline,
    projectedUsd: projected,
    deltaUsd: +(projected - baseline).toFixed(2),
    deltaPct: +(pct * 100).toFixed(1),
    rationale: `Estimated ${region} pump-price move from crude / refined-product and freight cost pass-through. Illustrative model — not a forecast.`,
    estimated: true,
  };
}

export interface AskResult {
  answer: string; // markdown
  isScenario: boolean;
  scenario: ScenarioImpact | null;
  source: 'ai' | 'heuristic';
}

// ── Geocoding: named places → coordinates + country ───────────────────────
type Place = { lat: number; lng: number; country: string; label: string };
const PLACES: Record<string, Place> = {
  houston: { lat: 29.76, lng: -95.37, country: 'USA', label: 'Houston' },
  'los angeles': { lat: 33.74, lng: -118.27, country: 'USA', label: 'Los Angeles' },
  la: { lat: 33.74, lng: -118.27, country: 'USA', label: 'Los Angeles' },
  'long beach': { lat: 33.75, lng: -118.21, country: 'USA', label: 'Long Beach' },
  california: { lat: 34.0, lng: -118.2, country: 'USA', label: 'California' },
  'new york': { lat: 40.71, lng: -74.0, country: 'USA', label: 'New York' },
  usa: { lat: 39.0, lng: -98.0, country: 'USA', label: 'United States' },
  'united states': { lat: 39.0, lng: -98.0, country: 'USA', label: 'United States' },
  shanghai: { lat: 31.23, lng: 121.47, country: 'China', label: 'Shanghai' },
  shenzhen: { lat: 22.54, lng: 114.06, country: 'China', label: 'Shenzhen' },
  guangzhou: { lat: 23.13, lng: 113.26, country: 'China', label: 'Guangzhou' },
  china: { lat: 30.0, lng: 110.0, country: 'China', label: 'China' },
  taiwan: { lat: 23.7, lng: 120.9, country: 'Taiwan', label: 'Taiwan' },
  rotterdam: { lat: 51.95, lng: 4.14, country: 'Netherlands', label: 'Rotterdam' },
  'ho chi minh': { lat: 10.82, lng: 106.63, country: 'Vietnam', label: 'Ho Chi Minh' },
  vietnam: { lat: 16.0, lng: 107.8, country: 'Vietnam', label: 'Vietnam' },
  singapore: { lat: 1.29, lng: 103.85, country: 'Singapore', label: 'Singapore' },
  suez: { lat: 30.0, lng: 32.55, country: 'Egypt', label: 'Suez Canal' },
  hormuz: { lat: 26.57, lng: 56.25, country: '', label: 'Strait of Hormuz' },
  'strait of hormuz': { lat: 26.57, lng: 56.25, country: '', label: 'Strait of Hormuz' },
  'persian gulf': { lat: 26.57, lng: 56.25, country: '', label: 'Persian Gulf' },
  malacca: { lat: 2.5, lng: 101.0, country: '', label: 'Strait of Malacca' },
  panama: { lat: 9.08, lng: -79.68, country: 'Panama', label: 'Panama Canal' },
  'south china sea': { lat: 15.0, lng: 115.0, country: '', label: 'South China Sea' },
  japan: { lat: 35.68, lng: 139.69, country: 'Japan', label: 'Japan' },
  tokyo: { lat: 35.68, lng: 139.69, country: 'Japan', label: 'Tokyo' },
};

export function geocode(text: string): Place | null {
  const q = text.toLowerCase();
  // Prefer longer keys first so "los angeles" beats "la"
  const keys = Object.keys(PLACES).sort((a, b) => b.length - a.length);
  for (const k of keys) if (q.includes(k)) return PLACES[k];
  return null;
}

// Rough planar distance in degrees (good enough for map-scale proximity).
function distDeg(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = aLat - bLat;
  const dLng = (aLng - bLng) * Math.cos(((aLat + bLat) / 2) * (Math.PI / 180));
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

// Given an epicenter, find the ports and shipments it disrupts.
export function resolveAffected(epi: Place, radius = 20) {
  const near = (lat: number, lng: number) => distDeg(lat, lng, epi.lat, epi.lng) < radius;

  const affectedPortIds = ports
    .filter((p) => near(p.lat, p.lng) || (epi.country && p.country === epi.country))
    .map((p) => p.id);

  const affectedShipmentIds = shipments
    .filter(
      (s) =>
        near(s.destination.lat, s.destination.lng) ||
        near(s.origin.lat, s.origin.lng) ||
        s.waypoints.some((w) => near(w[0], w[1])) ||
        (epi.country && s.destination.name.includes(epi.country)) ||
        (epi.country && s.origin.name.includes(epi.country)),
    )
    .map((s) => s.id);

  return { affectedPortIds, affectedShipmentIds };
}

// ── Scenario detection + build (heuristic) ────────────────────────────────
const SCENARIO_WORDS = [
  'what if', 'whatif', 'storm', 'typhoon', 'hurricane', 'cyclone', 'earthquake',
  'flood', 'close', 'closes', 'closed', 'closure', 'shut', 'shutdown', 'strike',
  'blocked', 'blockade', 'lands', 'hits', 'hit', 'disrupt', 'tsunami', 'tariff', 'war',
];

function severityFor(q: string): ScenarioImpact['severity'] {
  if (/(typhoon|hurricane|earthquake|tsunami|war|shutdown|closure|closes|closed|blockade)/.test(q)) return 'high';
  if (/(storm|strike|flood|blocked|disrupt|cyclone|tariff)/.test(q)) return 'medium';
  return 'low';
}

export function looksLikeScenario(q: string): boolean {
  const t = q.toLowerCase();
  return SCENARIO_WORDS.some((w) => t.includes(w));
}

export function buildScenario(question: string): ScenarioImpact | null {
  const epi = geocode(question) || PLACES['south china sea'];
  const { affectedPortIds, affectedShipmentIds } = resolveAffected(epi);
  const severity = severityFor(question.toLowerCase());
  const riskDelta = (severity === 'high' ? 22 : severity === 'medium' ? 13 : 6) +
    Math.min(affectedShipmentIds.length * 2, 12);

  const affectedShips = shipments.filter((s) => affectedShipmentIds.includes(s.id));
  const exposure = affectedShips.reduce((sum, s) => sum + s.cargoValue, 0);

  const title = question.trim().replace(/^what if\s*/i, '').replace(/\?$/, '') || `Disruption near ${epi.label}`;
  const summary =
    `Simulated disruption centered on ${epi.label}. ${affectedShipmentIds.length} shipment(s) ` +
    `and ${affectedPortIds.length} port(s) in the impact zone. Estimated cargo exposure ` +
    `$${(exposure / 1_000_000).toFixed(1)}M. Affected lanes are rerouted around the impact area; ` +
    `overall network risk rises ~${riskDelta} points.`;

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    summary,
    severity,
    riskDelta,
    epicenter: epi,
    affectedPortIds,
    affectedShipmentIds,
  };
}

// ── Non-scenario heuristic answers ────────────────────────────────────────
function fuzzyCanned(q: string): string | null {
  const t = q.toLowerCase();
  let best: { score: number; resp: string } | null = null;
  for (const item of nlQueries) {
    const words = item.query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const score = words.filter((w) => t.includes(w)).length;
    if (score >= 2 && (!best || score > best.score)) best = { score, resp: item.response };
  }
  return best?.resp ?? null;
}

export function heuristicAnswer(question: string): AskResult {
  const t = question.toLowerCase();

  if (looksLikeScenario(question) && (geocode(question) || /port|route|lane|shipment|strait|canal|oil|crude|war|tariff|supplier/.test(t))) {
    const scenario = buildScenario(question);
    if (scenario) {
      return {
        answer: `**🌀 Scenario simulated: ${scenario.title}**\n\n${scenario.summary}\n\nThe Global View has been updated — affected ports are flagged and impacted lanes rerouted. Use **Reset** on the map to clear the simulation.`,
        isScenario: true,
        scenario,
        source: 'heuristic',
      };
    }
  }

  // Delayed shipments
  if (/delay|late|behind schedule/.test(t)) {
    const delayed = shipments.filter((s) => s.status === 'delayed' || s.delayDays > 0);
    const lines = delayed.map((s) => `• **${s.vesselName}** — ${s.delayDays}d late, ${s.origin.name} → ${s.destination.name} (${s.cargo})`).join('\n');
    return { answer: `**Delayed shipments (${delayed.length}):**\n\n${lines || 'No delayed shipments right now.'}`, isScenario: false, scenario: null, source: 'heuristic' };
  }

  // Worst on-time suppliers
  if (/(worst|lowest|poor).*(on.?time|delivery|supplier)|supplier.*(worst|risk)/.test(t)) {
    const worst = [...suppliers].sort((a, b) => a.onTimeDelivery - b.onTimeDelivery).slice(0, 5);
    const lines = worst.map((s) => `• **${s.name}** (${s.country}) — ${s.onTimeDelivery}% OTD, risk ${s.riskScore}/100`).join('\n');
    return { answer: `**Lowest on-time-delivery suppliers:**\n\n${lines}`, isScenario: false, scenario: null, source: 'heuristic' };
  }

  // China exposure
  if (/china.*(exposure|risk|concentration)|exposure.*china/.test(t)) {
    const china = suppliers.filter((s) => s.country === 'China');
    const pct = Math.round((china.length / suppliers.length) * 100);
    return { answer: `**China exposure:** ${china.length} of ${suppliers.length} suppliers (${pct}%) are China-based. Concentration risk is elevated; diversifying toward Vietnam and Mexico would reduce single-region dependency.`, isScenario: false, scenario: null, source: 'heuristic' };
  }

  // Try a canned match for the example prompts
  const canned = fuzzyCanned(question);
  if (canned) return { answer: canned, isScenario: false, scenario: null, source: 'heuristic' };

  // Generic fallback summary
  const otd = kpiHistory[kpiHistory.length - 1]?.onTimeDelivery ?? 0;
  const openAlerts = alerts.filter((a) => !a.isRead).length;
  return {
    answer:
      `I read that as a general query. Here's the current picture:\n\n` +
      `• **${shipments.length}** active shipments, **${shipments.filter((s) => s.status === 'delayed').length}** delayed\n` +
      `• On-time delivery: **${otd}%**\n` +
      `• **${openAlerts}** unread alerts across ${ports.length} monitored ports\n\n` +
      `Try a what-if like *"What if a typhoon closes the Port of Shanghai?"* to simulate impact on the map.`,
    isScenario: false,
    scenario: null,
    source: 'heuristic',
  };
}
