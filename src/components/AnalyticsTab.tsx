'use client';

import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts';
import { kpiHistory, costBreakdown, leadTimeTrends, suppliers, disruptionHistory, riskForecasts } from '@/data/demo';

const COLORS = ['#00D4AA', '#3B82F6', '#8B5CF6', '#FFC107', '#FF4757', '#FF6B81'];

export default function AnalyticsTab() {
  // Supplier scorecard data for radar chart
  const topSuppliers = suppliers.slice(0, 5).map(s => ({
    supplier: s.name.split(' ').slice(0, 2).join(' '),
    Quality: s.qualityScore,
    Reliability: s.reliabilityScore,
    Cost: s.costScore,
    'Lead Time': Math.max(0, 100 - s.leadTimeDays * 2),
    Capacity: s.capacityScore,
  }));

  // Merge lead time data into a single array for the chart
  const leadTimeData = kpiHistory.map((kpi, i) => {
    const row: Record<string, string | number> = { month: kpi.month };
    leadTimeTrends.forEach(supplier => {
      row[supplier.supplier] = supplier.data[i]?.leadTime ?? 0;
    });
    return row;
  });

  return (
    <div className="space-y-6 pb-8">
      <motion.h2 
        className="text-xl font-bold text-white"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📊 Analytics & Intelligence
      </motion.h2>

      {/* Row 1: Lead Time Trends + Cost Analysis */}
      <div className="grid grid-cols-2 gap-6">
        {/* Lead Time Trends */}
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-sm font-semibold text-white mb-4">Lead Time Trends (12 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={leadTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#64748B', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              />
              <YAxis 
                tick={{ fill: '#64748B', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                domain={[15, 45]}
                label={{ value: 'Days', position: 'insideLeft', fill: '#64748B', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(15, 22, 41, 0.95)', 
                  border: '1px solid rgba(0,212,170,0.15)',
                  borderRadius: '8px',
                  color: '#E2E8F0',
                  fontSize: '11px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#94A3B8' }} />
              {leadTimeTrends.map((supplier, i) => (
                <Line
                  key={supplier.supplier}
                  dataKey={supplier.supplier}
                  name={supplier.supplier}
                  stroke={COLORS[i]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: COLORS[i] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Cost Analysis */}
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-semibold text-white mb-4">Cost Breakdown per Unit (12 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={costBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#64748B', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              />
              <YAxis 
                tick={{ fill: '#64748B', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                label={{ value: 'USD', position: 'insideLeft', fill: '#64748B', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(15, 22, 41, 0.95)', 
                  border: '1px solid rgba(0,212,170,0.15)',
                  borderRadius: '8px',
                  color: '#E2E8F0',
                  fontSize: '11px'
                }}
                formatter={(value) => [`$${Number(value).toFixed(2)}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#94A3B8' }} />
              <Bar dataKey="freight" name="Freight" stackId="a" fill="#00D4AA" radius={[0, 0, 0, 0]} />
              <Bar dataKey="duties" name="Duties" stackId="a" fill="#3B82F6" />
              <Bar dataKey="insurance" name="Insurance" stackId="a" fill="#8B5CF6" />
              <Bar dataKey="handling" name="Handling" stackId="a" fill="#FFC107" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 2: Supplier Scorecard + Risk Forecast */}
      <div className="grid grid-cols-2 gap-6">
        {/* Supplier Scorecard Radar */}
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="text-sm font-semibold text-white mb-4">Supplier Scorecard Comparison</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={[
              { metric: 'Quality', ...Object.fromEntries(topSuppliers.map(s => [s.supplier, s.Quality])) },
              { metric: 'Reliability', ...Object.fromEntries(topSuppliers.map(s => [s.supplier, s.Reliability])) },
              { metric: 'Cost', ...Object.fromEntries(topSuppliers.map(s => [s.supplier, s.Cost])) },
              { metric: 'Lead Time', ...Object.fromEntries(topSuppliers.map(s => [s.supplier, s['Lead Time']])) },
              { metric: 'Capacity', ...Object.fromEntries(topSuppliers.map(s => [s.supplier, s.Capacity])) },
            ]}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 9 }} />
              {topSuppliers.map((s, i) => (
                <Radar key={s.supplier} name={s.supplier} dataKey={s.supplier}
                       stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.1} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: '10px', color: '#94A3B8' }} />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(15, 22, 41, 0.95)', 
                  border: '1px solid rgba(0,212,170,0.15)',
                  borderRadius: '8px',
                  color: '#E2E8F0',
                  fontSize: '11px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Forecast */}
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="text-sm font-semibold text-white mb-1">AI Risk Forecast — Next 30 Days</h3>
          <p className="text-[10px] text-[#64748B] mb-4">Simulated predictive analysis</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={riskForecasts}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: 'rgba(15,22,41,0.95)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: '8px', color: '#E2E8F0', fontSize: '11px' }} />
              <Area type="monotone" dataKey="overallRisk" name="Overall" stroke="#FF4757" fill="#FF475720" strokeWidth={2} />
              <Area type="monotone" dataKey="portRisk" name="Port" stroke="#FFC107" fill="#FFC10710" strokeWidth={1.5} strokeDasharray="4 4" />
              <Area type="monotone" dataKey="weatherRisk" name="Weather" stroke="#3B82F6" fill="#3B82F610" strokeWidth={1.5} strokeDasharray="4 4" />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {riskForecasts.slice(0, 2).map((forecast, i) => (
              <div key={i} className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${forecast.overallRisk > 55 ? '#FF4757' : '#FFC107'}` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white">{forecast.week}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ 
                          background: `${forecast.overallRisk > 55 ? '#FF4757' : '#FFC107'}15`, 
                          color: forecast.overallRisk > 55 ? '#FF4757' : '#FFC107' 
                        }}>
                    Risk: {forecast.overallRisk}
                  </span>
                </div>
                <p className="text-[10px] text-[#94A3B8] leading-relaxed">{forecast.prediction}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 3: Disruption History Timeline */}
      <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h3 className="text-sm font-semibold text-white mb-4">Disruption History & Impact Analysis</h3>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px" style={{ background: 'rgba(0,212,170,0.15)' }} />
          
          <div className="space-y-4">
            {disruptionHistory.map((event, i) => {
              const impactColor = event.impact === 'critical' ? '#FF4757' : event.impact === 'high' ? '#FF6B81' : event.impact === 'medium' ? '#FFC107' : '#00D4AA';
              return (
                <motion.div 
                  key={event.id} 
                  className="flex items-start gap-4 ml-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                       style={{ background: `${impactColor}20`, border: `2px solid ${impactColor}` }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: impactColor }} />
                  </div>
                  <div className="flex-1 glass-card p-3 !rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h4 className="text-xs font-semibold text-white">{event.title}</h4>
                        <p className="text-[10px] text-[#64748B]">{event.date} • {event.durationDays} days</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full uppercase font-medium"
                              style={{ background: `${impactColor}15`, color: impactColor }}>
                          {event.impact}
                        </span>
                        <span className="text-[10px] text-[#FF4757] font-medium">
                          -${(event.revenueImpact / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mb-1">{event.description}</p>
                    <p className="text-[10px] text-[#00D4AA]">
                      <span className="text-[#64748B]">Resolution:</span> {event.resolution}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Row 4: On-Time Delivery + Total Shipments Trend */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h3 className="text-sm font-semibold text-white mb-4">On-Time Delivery Rate</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={kpiHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} domain={[75, 100]} />
              <Tooltip contentStyle={{ background: 'rgba(15,22,41,0.95)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: '8px', color: '#E2E8F0', fontSize: '11px' }} />
              <Area type="monotone" dataKey="onTimeDelivery" name="OTD %" stroke="#00D4AA" fill="url(#otdGradient)" strokeWidth={2} />
              <defs>
                <linearGradient id="otdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4AA" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00D4AA" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <h3 className="text-sm font-semibold text-white mb-4">Monthly Shipment Volume</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={kpiHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <Tooltip contentStyle={{ background: 'rgba(15,22,41,0.95)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: '8px', color: '#E2E8F0', fontSize: '11px' }} />
              <Bar dataKey="totalShipments" name="Shipments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="disruptionCount" name="Disruptions" fill="#FF475760" radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
