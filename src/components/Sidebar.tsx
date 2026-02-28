'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { alerts, kpiHistory, overallRiskScore, avgOnTimeDelivery, avgLeadTime, currentInventoryCoverage, totalInTransitValue } from '@/data/demo';

export default function Sidebar() {
  const [alertFilter, setAlertFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const filteredAlerts = alertFilter === 'all' ? alerts : alerts.filter(a => a.severity === alertFilter);
  const latestKPI = kpiHistory[kpiHistory.length - 1];

  return (
    <div className="h-full overflow-y-auto py-4 px-4 space-y-4" style={{ background: 'rgba(10, 14, 26, 0.6)' }}>
      {/* Risk Score Gauge */}
      <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Supply Chain Health</h3>
        <div className="flex items-center gap-4">
          <RiskGauge score={overallRiskScore} />
          <div>
            <p className="text-2xl font-bold text-white">{overallRiskScore}<span className="text-sm text-[#64748B]">/100</span></p>
            <p className="text-xs text-[#FFC107] font-medium">Moderate Risk</p>
            <p className="text-[10px] text-[#64748B] mt-0.5">3 critical alerts active</p>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div className="grid grid-cols-2 gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <KPICard 
          label="On-Time Delivery" 
          value={`${avgOnTimeDelivery}%`} 
          trend={avgOnTimeDelivery > 88 ? 'up' : 'down'}
          delta="+2.1%"
          color="#00D4AA" 
        />
        <KPICard 
          label="Avg Lead Time" 
          value={`${avgLeadTime}d`} 
          trend="down"
          delta="-1.2d"
          color="#3B82F6" 
        />
        <KPICard 
          label="Inventory Coverage" 
          value={`${currentInventoryCoverage}d`} 
          trend="neutral"
          delta="0d"
          color="#8B5CF6" 
        />
        <KPICard 
          label="In-Transit Value" 
          value={`$${(totalInTransitValue / 1000000).toFixed(1)}M`} 
          trend="up"
          delta="+$1.2M"
          color="#FFC107" 
        />
      </motion.div>

      {/* Cost Trend Mini Chart */}
      <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Cost/Unit Trend</h3>
          <span className="text-xs text-[#FF4757] font-medium">+$0.50 ↑</span>
        </div>
        <div className="flex items-end gap-0.5 h-12">
          {kpiHistory.map((kpi, i) => {
            const height = ((kpi.costPerUnit - 12) / 3) * 100;
            return (
              <motion.div
                key={i}
                className="flex-1 rounded-t-sm"
                style={{ 
                  height: `${Math.max(height, 10)}%`, 
                  background: i === kpiHistory.length - 1 ? '#00D4AA' : 'rgba(0, 212, 170, 0.3)',
                }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(height, 10)}%` }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-[#64748B] mt-1">
          <span>Mar</span><span>Feb</span>
        </div>
      </motion.div>

      {/* Active Alerts */}
      <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
            Active Alerts
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-[#FF4757] text-white font-bold">
              {alerts.filter(a => !a.isRead).length}
            </span>
          </h3>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-3">
          {(['all', 'critical', 'warning', 'info'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setAlertFilter(filter)}
              className={`text-[10px] px-2 py-1 rounded-md font-medium capitalize cursor-pointer transition-colors ${
                alertFilter === filter 
                  ? 'text-[#00D4AA] bg-[rgba(0,212,170,0.1)]' 
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-[280px] overflow-y-auto">
          {filteredAlerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              className="p-2.5 rounded-lg cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.02)]"
              style={{ 
                background: alert.isRead ? 'transparent' : 'rgba(255,255,255,0.02)',
                borderLeft: `3px solid ${alert.severity === 'critical' ? '#FF4757' : alert.severity === 'warning' ? '#FFC107' : '#3B82F6'}`,
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
            >
              <div className="flex items-start gap-2">
                <span className="text-xs mt-0.5">
                  {alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟡' : 'ℹ️'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white leading-tight">{alert.title}</p>
                  <p className="text-[10px] text-[#64748B] mt-0.5 line-clamp-2">{alert.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded capitalize"
                          style={{ 
                            background: 'rgba(0,212,170,0.08)', 
                            color: '#00D4AA',
                            fontSize: '9px'
                          }}>
                      {alert.category}
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      {new Date(alert.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                {!alert.isRead && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] mt-1.5 shrink-0" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Events Timeline */}
      <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Recent Events</h3>
        <div className="space-y-3">
          {[
            { time: '2h ago', event: 'MV Seoul Spirit passed customs clearance at LA', icon: '✅' },
            { time: '4h ago', event: 'Typhoon Maysak upgraded to Category 2', icon: '🌀' },
            { time: '6h ago', event: 'Foxlink audit result received — FAILED', icon: '❌' },
            { time: '8h ago', event: 'MV Gulf Runner departed Veracruz on schedule', icon: '🚢' },
            { time: '12h ago', event: 'Lithium spot price hit $42K/ton (new 2026 high)', icon: '📈' },
            { time: '1d ago', event: 'Monterrey CableTech Phase 2 expansion completed', icon: '🏗️' },
          ].map((event, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="flex flex-col items-center">
                <span className="text-sm">{event.icon}</span>
                {i < 5 && <div className="w-px h-4 mt-1" style={{ background: 'rgba(0,212,170,0.1)' }} />}
              </div>
              <div>
                <p className="text-xs text-[#E2E8F0] leading-tight">{event.event}</p>
                <p className="text-[10px] text-[#64748B]">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Shipment Summary */}
      <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Active Shipments</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-[#00D4AA]">5</p>
            <p className="text-[10px] text-[#64748B]">On-Time</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#FF4757]">2</p>
            <p className="text-[10px] text-[#64748B]">Delayed</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#FFC107]">1</p>
            <p className="text-[10px] text-[#64748B]">At Risk</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#3B82F6]">0</p>
            <p className="text-[10px] text-[#64748B]">Arrived</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function RiskGauge({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 80 ? '#00D4AA' : score >= 60 ? '#FFC107' : '#FF4757';

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
      <motion.circle
        cx="50" cy="50" r={radius} fill="none" 
        stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        transform="rotate(-90 50 50)"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - progress }}
        transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
    </svg>
  );
}

function KPICard({ label, value, trend, delta, color }: { 
  label: string; value: string; trend: 'up' | 'down' | 'neutral'; delta: string; color: string 
}) {
  return (
    <div className="glass-card p-3">
      <p className="text-[10px] text-[#64748B] mb-1">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
      <div className="flex items-center gap-1 mt-0.5">
        <span className={`text-[10px] font-medium ${
          trend === 'up' ? 'text-[#00D4AA]' : trend === 'down' ? 'text-[#FF4757]' : 'text-[#64748B]'
        }`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {delta}
        </span>
      </div>
    </div>
  );
}
