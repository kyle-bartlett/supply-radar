'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { whatIfScenarios, suppliers } from '@/data/demo';
import { estimateFuelImpact, GAS_BASELINE_FALLBACK } from '@/lib/askEngine';

const TYPE_SEVERITY: Record<string, string> = {
  natural_disaster: 'high',
  port_closure: 'medium',
  supplier_shutdown: 'medium',
  tariff_change: 'low',
};

export default function WhatIfTab() {
  const [selectedScenario, setSelectedScenario] = useState<(typeof whatIfScenarios)[0] | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [gasBaseline, setGasBaseline] = useState<{ price: number; region: string }>({ price: GAS_BASELINE_FALLBACK, region: 'Houston (Gulf Coast)' });

  useEffect(() => {
    let alive = true;
    fetch('/api/gas').then((r) => r.json()).then((d) => { if (alive) setGasBaseline({ price: d.price, region: d.region }); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const fuelFor = (s: (typeof whatIfScenarios)[0]) =>
    estimateFuelImpact({
      baseline: gasBaseline.price,
      severity: TYPE_SEVERITY[s.type] || 'medium',
      text: `${s.name} ${s.description} ${s.affectedRegion}`,
      region: gasBaseline.region,
    });

  const handleSelect = (scenario: (typeof whatIfScenarios)[0]) => {
    setIsSimulating(true);
    setSelectedScenario(null);
    setTimeout(() => {
      setSelectedScenario(scenario);
      setIsSimulating(false);
    }, 1500);
  };

  const typeIcons: Record<string, string> = {
    port_closure: '🚫',
    supplier_shutdown: '🏭',
    natural_disaster: '🌊',
    tariff_change: '💰',
  };

  const typeColors: Record<string, string> = {
    port_closure: '#FF4757',
    supplier_shutdown: '#FFC107',
    natural_disaster: '#3B82F6',
    tariff_change: '#8B5CF6',
  };

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-white mb-1">🔮 What-If Scenario Modeling</h2>
        <p className="text-xs text-[#64748B]">Simulate disruptions and analyze projected supply chain impact in real-time</p>
      </motion.div>

      {/* Scenario Selector Cards */}
      <div className="grid grid-cols-5 gap-3">
        {whatIfScenarios.map((scenario, i) => {
          const color = typeColors[scenario.type] || '#00D4AA';
          const isActive = selectedScenario?.id === scenario.id;
          return (
            <motion.button
              key={scenario.id}
              onClick={() => handleSelect(scenario)}
              className={`glass-card p-4 text-left cursor-pointer transition-all duration-300 ${isActive ? 'ring-1' : ''}`}
              style={isActive ? { borderColor: color, boxShadow: `0 0 20px ${color}20` } : {}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ scale: 1.02, borderColor: `${color}40` }}
            >
              <div className="text-2xl mb-2">{typeIcons[scenario.type]}</div>
              <h4 className="text-xs font-semibold text-white leading-tight mb-1">{scenario.name}</h4>
              <p className="text-[10px] text-[#64748B] capitalize">{scenario.type.replace('_', ' ')}</p>
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
                   style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5' }}>
                ⛽ +${fuelFor(scenario).deltaUsd.toFixed(2)} <span className="text-[#64748B]">gas est.</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Simulation Loading */}
      <AnimatePresence>
        {isSimulating && (
          <motion.div
            className="glass-card p-8 text-center"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-[#00D4AA] border-t-transparent animate-spin" />
            <p className="text-sm text-[#94A3B8]">Running scenario simulation...</p>
            <p className="text-[10px] text-[#64748B] mt-1">Analyzing 15 suppliers • 8 routes • 6 ports</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {selectedScenario && !isSimulating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Scenario Description */}
            <div className="glass-card p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl"
                     style={{ 
                       background: `${typeColors[selectedScenario.type]}15`, 
                       border: `1px solid ${typeColors[selectedScenario.type]}30` 
                     }}>
                  {typeIcons[selectedScenario.type]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedScenario.name}</h3>
                  <p className="text-xs text-[#94A3B8] mt-1">{selectedScenario.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(0,212,170,0.08)', color: '#00D4AA' }}>
                      Region: {selectedScenario.affectedRegion}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,71,87,0.08)', color: '#FF4757' }}>
                      {selectedScenario.affectedSuppliers.length} suppliers affected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Overview Cards */}
            <div className="grid grid-cols-4 gap-3">
              <ImpactCard
                label="Delayed Shipments"
                value={selectedScenario.projectedImpact.delayedShipments.toString()}
                icon="📦"
                color="#FF4757"
              />
              <ImpactCard
                label="Revenue at Risk"
                value={`$${(selectedScenario.projectedImpact.revenueAtRisk / 1000000).toFixed(1)}M`}
                icon="💸"
                color="#FFC107"
              />
              <ImpactCard
                label="Recovery Time"
                value={`${selectedScenario.projectedImpact.estimatedRecoveryDays}d`}
                icon="⏱️"
                color="#3B82F6"
              />
              <ImpactCard
                label="Additional Cost"
                value={`$${(selectedScenario.projectedImpact.additionalCost / 1000000).toFixed(1)}M`}
                icon="📊"
                color="#8B5CF6"
              />
            </div>

            {/* Estimated Local Gas Impact */}
            {(() => {
              const f = fuelFor(selectedScenario);
              return (
                <div className="glass-card p-4 flex items-center justify-between gap-4" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#64748B] mb-1">⛽ Estimated Local Gas Impact — {f.region}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-[#94A3B8] line-through">${f.baselineUsd.toFixed(2)}</span>
                      <span className="text-xl font-bold text-[#FCA5A5]">${f.projectedUsd.toFixed(2)}</span>
                      <span className="text-xs text-[#EF4444]">▲ +${f.deltaUsd.toFixed(2)} ({f.deltaPct}%)</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#64748B] max-w-[46%] text-right leading-tight">Illustrative model of pump-price pass-through — not a forecast.</p>
                </div>
              );
            })()}

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Current State */}
              <motion.div 
                className="glass-card p-5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[#00D4AA]" />
                  <h4 className="text-sm font-semibold text-[#00D4AA]">Current State</h4>
                </div>
                <div className="space-y-4">
                  <ComparisonMetric
                    label="Avg Lead Time"
                    value={`${selectedScenario.currentState.avgLeadTime} days`}
                    percentage={selectedScenario.currentState.avgLeadTime / 60 * 100}
                    color="#00D4AA"
                  />
                  <ComparisonMetric
                    label="On-Time Rate"
                    value={`${selectedScenario.currentState.onTimeRate}%`}
                    percentage={selectedScenario.currentState.onTimeRate}
                    color="#00D4AA"
                  />
                  <ComparisonMetric
                    label="Cost per Unit"
                    value={`$${selectedScenario.currentState.costPerUnit.toFixed(2)}`}
                    percentage={selectedScenario.currentState.costPerUnit / 45 * 100}
                    color="#00D4AA"
                  />
                </div>
              </motion.div>

              {/* Disrupted State */}
              <motion.div 
                className="glass-card p-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[#FF4757] pulse-red" />
                  <h4 className="text-sm font-semibold text-[#FF4757]">Disrupted State</h4>
                </div>
                <div className="space-y-4">
                  <ComparisonMetric
                    label="Avg Lead Time"
                    value={`${selectedScenario.disruptedState.avgLeadTime} days`}
                    percentage={selectedScenario.disruptedState.avgLeadTime / 60 * 100}
                    color="#FF4757"
                    delta={`+${selectedScenario.disruptedState.avgLeadTime - selectedScenario.currentState.avgLeadTime}d`}
                  />
                  <ComparisonMetric
                    label="On-Time Rate"
                    value={`${selectedScenario.disruptedState.onTimeRate}%`}
                    percentage={selectedScenario.disruptedState.onTimeRate}
                    color="#FF4757"
                    delta={`${selectedScenario.disruptedState.onTimeRate - selectedScenario.currentState.onTimeRate}%`}
                  />
                  <ComparisonMetric
                    label="Cost per Unit"
                    value={`$${selectedScenario.disruptedState.costPerUnit.toFixed(2)}`}
                    percentage={selectedScenario.disruptedState.costPerUnit / 45 * 100}
                    color="#FF4757"
                    delta={`+$${(selectedScenario.disruptedState.costPerUnit - selectedScenario.currentState.costPerUnit).toFixed(2)}`}
                  />
                </div>
              </motion.div>
            </div>

            {/* Alternative Routes & Mitigation */}
            <div className="grid grid-cols-2 gap-4">
              {/* Alternative Routes */}
              <motion.div 
                className="glass-card p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h4 className="text-sm font-semibold text-white mb-3">
                  <span className="mr-2">🛤️</span>Alternative Routes & Mitigation
                </h4>
                <div className="space-y-2">
                  {selectedScenario.projectedImpact.alternativeRoutes.map((route, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-2 p-2.5 rounded-lg"
                      style={{ background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.08)' }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <span className="text-xs text-[#00D4AA] font-bold mt-0.5">{i + 1}</span>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">{route}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Affected Suppliers */}
              <motion.div 
                className="glass-card p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="text-sm font-semibold text-white mb-3">
                  <span className="mr-2">🏭</span>Affected Suppliers
                </h4>
                <div className="space-y-2">
                  {selectedScenario.affectedSuppliers.map((supId, i) => {
                    const supplier = suppliers.find(s => s.id === supId);
                    if (!supplier) return null;
                    return (
                      <motion.div
                        key={supId}
                        className="flex items-center justify-between p-2.5 rounded-lg"
                        style={{ background: 'rgba(255,71,87,0.04)', border: '1px solid rgba(255,71,87,0.08)' }}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <div>
                          <p className="text-xs font-medium text-white">{supplier.name}</p>
                          <p className="text-[10px] text-[#64748B]">{supplier.city}, {supplier.country}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-[#FF4757] font-medium">Risk: {supplier.riskScore}</p>
                          <p className="text-[10px] text-[#64748B]">{supplier.products[0]}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* AI Recommendation */}
            <motion.div 
              className="glass-card p-5"
              style={{ borderLeft: '3px solid #00D4AA' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(0,212,170,0.1)' }}>
                  <span className="text-xs">🤖</span>
                </div>
                <span className="text-xs text-[#00D4AA] font-semibold">AI Recommendation</span>
              </div>
              <p className="text-xs text-[#E2E8F0] leading-relaxed">
                Based on this scenario analysis, we recommend <strong className="text-[#00D4AA]">immediately activating contingency plan Alpha-3</strong>. 
                Priority actions: (1) Pre-position {Math.ceil(selectedScenario.projectedImpact.estimatedRecoveryDays / 7)} weeks of safety stock for affected SKUs, 
                (2) Engage alternate {selectedScenario.type === 'port_closure' ? 'port routing via ' + selectedScenario.projectedImpact.alternativeRoutes[0].split('(')[0].trim() : 'suppliers in ' + selectedScenario.affectedRegion}, 
                (3) Alert sales team of potential {selectedScenario.projectedImpact.estimatedRecoveryDays}-day lead time extensions for affected product lines.
                Estimated cost of inaction: <span className="text-[#FF4757] font-semibold">${(selectedScenario.projectedImpact.revenueAtRisk / 1000000).toFixed(1)}M</span> in delayed revenue 
                vs. <span className="text-[#FFC107] font-semibold">${(selectedScenario.projectedImpact.additionalCost / 1000000).toFixed(1)}M</span> mitigation cost.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!selectedScenario && !isSimulating && (
        <motion.div 
          className="glass-card p-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-4xl mb-3">🔮</div>
          <h3 className="text-lg font-semibold text-white mb-2">Select a Scenario</h3>
          <p className="text-sm text-[#64748B] max-w-md mx-auto">
            Choose a disruption scenario above to simulate its impact on your supply chain. 
            The AI engine will analyze all routes, suppliers, and ports to project outcomes.
          </p>
        </motion.div>
      )}
    </div>
  );
}

function ImpactCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <motion.div 
      className="glass-card p-4 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-xl mb-1">{icon}</div>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px] text-[#64748B]">{label}</p>
    </motion.div>
  );
}

function ComparisonMetric({ label, value, percentage, color, delta }: { 
  label: string; value: string; percentage: number; color: string; delta?: string 
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[#94A3B8]">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color }}>{value}</span>
          {delta && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: `${color}15`, color }}>
              {delta}
            </span>
          )}
        </div>
      </div>
      <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
