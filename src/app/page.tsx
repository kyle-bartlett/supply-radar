'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
         style={{ background: 'radial-gradient(ellipse at 50% 50%, #0f1a2e 0%, #0A0E1A 70%)' }}>

      {/* Radar rings */}
      {[1, 2, 3, 4].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border"
          style={{
            width: `${ring * 250}px`,
            height: `${ring * 250}px`,
            borderColor: `rgba(0, 212, 170, ${0.12 - ring * 0.02})`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: ring * 0.2, duration: 1.2, ease: 'easeOut' }}
        />
      ))}

      {/* Radar sweep line */}
      <motion.div
        className="absolute w-[500px] h-[500px]"
        style={{ 
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0, 212, 170, 0.12) 30deg, transparent 60deg)',
          borderRadius: '50%'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Blip dots on radar */}
      {[[120, 80], [-150, 60], [80, -120], [-60, -80], [180, -40], [-100, 140]].map(([x, y], i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[#00D4AA]"
          style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.3], scale: [0, 1.2, 1] }}
          transition={{ delay: 1.5 + i * 0.3, duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />
      ))}

      {/* Logo & Content */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        {/* Icon */}
        <motion.div
          className="mx-auto mb-6 w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.15) 0%, rgba(0, 212, 170, 0.05) 100%)',
            border: '1px solid rgba(0, 212, 170, 0.2)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#00D4AA" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="20" cy="20" r="12" stroke="#00D4AA" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
            <circle cx="20" cy="20" r="6" stroke="#00D4AA" strokeWidth="1" opacity="0.4" />
            <circle cx="20" cy="20" r="2" fill="#00D4AA" />
            <line x1="20" y1="20" x2="20" y2="4" stroke="#00D4AA" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-6xl font-bold tracking-tight mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <span className="text-white">Supply</span>
          <span className="text-[#00D4AA]">Radar</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-lg mb-8"
          style={{ color: '#94A3B8' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          Real-time supply chain intelligence
        </motion.p>

        {/* Stat cards */}
        <motion.div
          className="flex gap-6 mb-10 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          {[
            { label: 'Suppliers', value: '15', icon: '🏭' },
            { label: 'Active Shipments', value: '8', icon: '🚢' },
            { label: 'Ports Monitored', value: '6', icon: '⚓' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card px-6 py-4 text-center min-w-[140px]"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-[#00D4AA]">{stat.value}</div>
              <div className="text-xs text-[#64748B]">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          className="px-8 py-4 rounded-xl font-semibold text-lg cursor-pointer transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #00D4AA 0%, #00B894 100%)',
            color: '#0A0E1A',
            boxShadow: '0 0 30px rgba(0, 212, 170, 0.3)',
          }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(0, 212, 170, 0.5)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/dashboard')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          Launch Dashboard (Demo)
          <span className="ml-2">→</span>
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="absolute bottom-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <p className="text-sm" style={{ color: '#64748B' }}>
          Powered by <span className="text-[#00D4AA] font-medium">Bartlett Labs</span>
        </p>
      </motion.div>
    </div>
  );
}
