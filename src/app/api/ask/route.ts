import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ports, shipments, suppliers, kpiHistory, alerts } from '@/data/demo';
import {
  heuristicAnswer,
  buildScenario,
  estimateFuelImpact,
  type AskResult,
  type ScenarioImpact,
} from '@/lib/askEngine';
import { getBaseline } from '@/lib/gas';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = 'claude-haiku-4-5-20251001';

export async function POST(req: NextRequest) {
  let question = '';
  try {
    ({ question } = await req.json());
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
  if (!question || typeof question !== 'string') {
    return NextResponse.json({ error: 'question required' }, { status: 400 });
  }

  // Per-IP rate limit — protects Anthropic token spend on a public endpoint.
  const rl = rateLimit(`ask:${clientIp(req.headers)}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      {
        answer: `⏳ Rate limit reached — please wait ${rl.retryAfter}s before asking again. This public demo caps requests to protect API costs.`,
        isScenario: false,
        scenario: null,
        source: 'heuristic',
      },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    );
  }

  const key = process.env.ANTHROPIC_API_KEY;
  let result: AskResult;
  if (!key) {
    // No key configured yet — deterministic engine still answers + drives the map.
    result = heuristicAnswer(question);
  } else {
    try {
      result = await askClaude(question, key);
    } catch (err) {
      console.error('[ask] Claude call failed, using heuristic:', err);
      result = heuristicAnswer(question);
    }
  }

  // Attach an illustrative local gas-price impact to any scenario.
  if (result.scenario) {
    const baseline = await getBaseline();
    result.scenario.fuelImpact = estimateFuelImpact({
      baseline: baseline.price,
      severity: result.scenario.severity,
      text: `${question} ${result.scenario.title} ${result.scenario.summary}`,
      region: baseline.region,
    });
  }

  return NextResponse.json(result);
}

function buildContext(): string {
  const portRows = ports.map(
    (p) => `${p.id} | ${p.name} (${p.country}) | congestion=${p.congestionLevel} | avgDelay=${p.avgDelayDays}d | util=${p.currentUtilization}%`,
  );
  const shipRows = shipments.map(
    (s) => `${s.id} | ${s.vesselName} | ${s.origin.name} -> ${s.destination.name} | status=${s.status} | delay=${s.delayDays}d | ${s.cargo} | $${(s.cargoValue / 1e6).toFixed(1)}M | ETA ${s.eta}`,
  );
  const supRows = suppliers.map(
    (s) => `${s.id} | ${s.name} (${s.country}) | risk=${s.riskScore}/100 | OTD=${s.onTimeDelivery}%`,
  );
  const k = kpiHistory[kpiHistory.length - 1];
  const openAlerts = alerts.filter((a) => !a.isRead).map((a) => `- [${a.severity}] ${a.title}`);

  return [
    '## PORTS (id | name | congestion | avgDelay | utilization)',
    ...portRows,
    '',
    '## SHIPMENTS (id | vessel | route | status | delay | cargo | value | ETA)',
    ...shipRows,
    '',
    '## SUPPLIERS (id | name | risk | on-time)',
    ...supRows,
    '',
    `## KPIs (latest): on-time ${k?.onTimeDelivery}% | lead time ${k?.avgLeadTime}d | inventory cover ${k?.inventoryCoverage}d | disruptions ${k?.disruptionCount}`,
    '',
    '## OPEN ALERTS',
    ...openAlerts,
  ].join('\n');
}

async function askClaude(question: string, apiKey: string): Promise<AskResult> {
  const client = new Anthropic({
    apiKey,
    defaultHeaders: {
      ...(process.env.ANTHROPIC_WORKSPACE_ID
        ? { 'anthropic-workspace-id': process.env.ANTHROPIC_WORKSPACE_ID }
        : {}),
    },
  });

  const system =
    `You are Supply Radar AI, a supply-chain risk analyst. Answer ONLY from the live data provided. ` +
    `Be concise and specific — cite vessel names, ports, and numbers. Use short markdown bullets. ` +
    `If the user poses a "what-if" / disruption scenario (a storm, closure, strike, tariff, etc.), set is_scenario=true and ` +
    `fill the scenario object: pick the geographic epicenter (lat/lng + label), and list the affectedPortIds and ` +
    `affectedShipmentIds (use the exact ids from the data) whose routes pass through or terminate near the epicenter. ` +
    `Estimate riskDelta (points added to overall network risk, 5-40). For normal questions, set is_scenario=false and scenario=null.`;

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system,
    tools: [
      {
        name: 'render_answer',
        description: 'Return the analyst answer and, for what-if scenarios, the structured map impact.',
        input_schema: {
          type: 'object',
          properties: {
            answer: { type: 'string', description: 'Concise markdown answer (<180 words), bullets preferred.' },
            is_scenario: { type: 'boolean' },
            scenario: {
              type: ['object', 'null'],
              properties: {
                title: { type: 'string' },
                summary: { type: 'string' },
                severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                riskDelta: { type: 'number' },
                epicenter: {
                  type: 'object',
                  properties: { lat: { type: 'number' }, lng: { type: 'number' }, label: { type: 'string' } },
                  required: ['lat', 'lng', 'label'],
                },
                affectedPortIds: { type: 'array', items: { type: 'string' } },
                affectedShipmentIds: { type: 'array', items: { type: 'string' } },
              },
              required: ['title', 'summary', 'severity', 'epicenter', 'affectedPortIds', 'affectedShipmentIds'],
            },
          },
          required: ['answer', 'is_scenario'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'render_answer' },
    messages: [{ role: 'user', content: `Data:\n${buildContext()}\n\nQuestion: ${question}` }],
  });

  const toolUse = resp.content.find((c) => c.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') throw new Error('no tool_use in response');
  const out = toolUse.input as {
    answer: string;
    is_scenario: boolean;
    scenario: ScenarioImpact | null;
  };

  let scenario = out.is_scenario ? out.scenario : null;
  if (scenario) scenario = sanitizeScenario(scenario, question);

  return {
    answer: out.answer,
    isScenario: !!scenario,
    scenario,
    source: 'ai',
  };
}

// Keep only real ids; if the model left the affected lists empty, fill them
// from the deterministic resolver so the map always reacts.
function sanitizeScenario(s: ScenarioImpact, question: string): ScenarioImpact {
  const portSet = new Set(ports.map((p) => p.id));
  const shipSet = new Set(shipments.map((sh) => sh.id));
  let affectedPortIds = (s.affectedPortIds || []).filter((id) => portSet.has(id));
  let affectedShipmentIds = (s.affectedShipmentIds || []).filter((id) => shipSet.has(id));

  if (!affectedPortIds.length || !affectedShipmentIds.length) {
    const fallback = buildScenario(question);
    if (fallback) {
      if (!affectedPortIds.length) affectedPortIds = fallback.affectedPortIds;
      if (!affectedShipmentIds.length) affectedShipmentIds = fallback.affectedShipmentIds;
      if (!s.epicenter || typeof s.epicenter.lat !== 'number') s.epicenter = fallback.epicenter;
    }
  }

  return {
    ...s,
    riskDelta: s.riskDelta && s.riskDelta > 0 ? s.riskDelta : 15,
    affectedPortIds,
    affectedShipmentIds,
  };
}
