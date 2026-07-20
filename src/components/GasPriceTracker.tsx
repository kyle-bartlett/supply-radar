'use client';

import { useEffect, useRef, useState } from 'react';
import type { FuelImpact } from '@/lib/askEngine';

// Live local gas-price tracker. Shows the current baseline (real from EIA when
// EIA_API_KEY is set) and animates to the scenario's projected price when a
// what-if is active. Projected values are an illustrative estimate, labeled.
export default function GasPriceTracker({ fuelImpact }: { fuelImpact?: FuelImpact | null }) {
  const [baseline, setBaseline] = useState<number | null>(null);
  const [region, setRegion] = useState('Houston (Gulf Coast)');
  const [source, setSource] = useState<'eia' | 'fallback' | null>(null);
  const [asOf, setAsOf] = useState('');
  const [display, setDisplay] = useState<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let alive = true;
    fetch('/api/gas')
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setBaseline(d.price);
        setRegion(d.region);
        setSource(d.source);
        setAsOf(d.asOf);
        setDisplay((prev) => (prev == null ? d.price : prev));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const target = fuelImpact ? fuelImpact.projectedUsd : baseline;

  // Tween the displayed number toward the target.
  useEffect(() => {
    if (target == null || display == null) return;
    const start = display;
    const end = target;
    if (Math.abs(start - end) < 0.001) return;
    const dur = 900;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(+(start + (end - start) * eased).toFixed(3));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  if (baseline == null || display == null) return null;
  const up = !!fuelImpact;

  return (
    <div
      className="glass-card px-4 py-3 select-none"
      style={{ minWidth: 210, borderColor: up ? 'rgba(239,68,68,0.45)' : undefined }}
    >
      <div className="flex items-center justify-between mb-1.5 gap-3">
        <span className="text-[10px] uppercase tracking-wider text-[#64748B] truncate">⛽ {region}</span>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0"
          style={
            up
              ? { background: 'rgba(239,68,68,0.14)', color: '#FCA5A5' }
              : source === 'eia'
              ? { background: 'rgba(0,212,170,0.14)', color: '#00D4AA' }
              : { background: 'rgba(148,163,184,0.14)', color: '#94A3B8' }
          }
        >
          {up ? 'simulated' : source === 'eia' ? 'live · EIA' : 'baseline'}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums" style={{ color: up ? '#FCA5A5' : '#00D4AA' }}>
          ${display.toFixed(2)}
        </span>
        {up && (
          <span className="text-xs font-medium text-[#EF4444]">
            ▲ +${fuelImpact!.deltaUsd.toFixed(2)} ({fuelImpact!.deltaPct}%)
          </span>
        )}
      </div>

      <p className="text-[10px] text-[#64748B] mt-1 leading-tight">
        {up
          ? `was $${fuelImpact!.baselineUsd.toFixed(2)} · estimated impact, not a forecast`
          : source === 'eia'
          ? `regular · EIA week of ${asOf}`
          : 'regular · demo baseline'}
      </p>
    </div>
  );
}
