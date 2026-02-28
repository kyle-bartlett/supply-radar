'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import NLSearchBar from '@/components/NLSearchBar';
import AnalyticsTab from '@/components/AnalyticsTab';
import WhatIfTab from '@/components/WhatIfTab';

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="w-full h-full shimmer" />
});

type Tab = 'map' | 'analytics' | 'whatif';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-screen h-screen flex items-center justify-center" style={{ background: '#0A0E1A' }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[#00D4AA] border-t-transparent animate-spin" />
          <p className="text-[#94A3B8]">Initializing Supply Radar...</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'map', label: 'Globe View', icon: '🌐' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'whatif', label: 'What-If', icon: '🔮' },
  ];

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden" style={{ background: '#0A0E1A' }}>
      {/* Top Bar */}
      <motion.header
        className="h-14 flex items-center justify-between px-4 z-50 shrink-0"
        style={{ 
          background: 'rgba(10, 14, 26, 0.95)',
          borderBottom: '1px solid rgba(0, 212, 170, 0.1)',
        }}
        initial={{ y: -56 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Left: Logo + Tabs */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 mr-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.2)' }}>
              <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#00D4AA" strokeWidth="2" strokeDasharray="4 3" />
                <circle cx="20" cy="20" r="10" stroke="#00D4AA" strokeWidth="1.5" opacity="0.6" />
                <circle cx="20" cy="20" r="3" fill="#00D4AA" />
              </svg>
            </div>
            <span className="font-bold text-lg">
              <span className="text-white">Supply</span>
              <span className="text-[#00D4AA]">Radar</span>
            </span>
          </div>

          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-[#00D4AA]'
                    : 'text-[#64748B] hover:text-[#94A3B8]'
                }`}
                style={activeTab === tab.id ? {
                  background: 'rgba(0, 212, 170, 0.1)',
                  border: '1px solid rgba(0, 212, 170, 0.15)',
                } : { border: '1px solid transparent' }}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center: NL Search */}
        <div className="flex-1 max-w-xl mx-8">
          <NLSearchBar />
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
            style={{ 
              background: sidebarOpen ? 'rgba(0, 212, 170, 0.1)' : 'transparent',
              border: '1px solid rgba(0, 212, 170, 0.15)',
              color: sidebarOpen ? '#00D4AA' : '#64748B'
            }}
            title="Toggle sidebar"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" 
               style={{ background: 'rgba(0, 212, 170, 0.08)', border: '1px solid rgba(0, 212, 170, 0.12)' }}>
            <div className="w-2 h-2 rounded-full bg-[#00D4AA] pulse-glow" />
            <span className="text-xs text-[#00D4AA] font-medium">LIVE</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map/Content Area */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {activeTab === 'map' && (
              <motion.div
                key="map"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MapView />
              </motion.div>
            )}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                className="absolute inset-0 overflow-y-auto p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AnalyticsTab />
              </motion.div>
            )}
            {activeTab === 'whatif' && (
              <motion.div
                key="whatif"
                className="absolute inset-0 overflow-y-auto p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <WhatIfTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="w-[380px] shrink-0 overflow-hidden"
              style={{ borderLeft: '1px solid rgba(0, 212, 170, 0.08)' }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
