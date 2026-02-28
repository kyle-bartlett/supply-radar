'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { nlQueries } from '@/data/demo';

export default function NLSearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<(typeof nlQueries)[0] | null>(null);
  const [typedResponse, setTypedResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Typing animation
  useEffect(() => {
    if (!selectedQuery) return;
    setIsTyping(true);
    setTypedResponse('');
    let i = 0;
    const text = selectedQuery.response;
    const timer = setInterval(() => {
      if (i < text.length) {
        setTypedResponse(text.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 8);
    return () => clearInterval(timer);
  }, [selectedQuery]);

  const handleSelect = (q: (typeof nlQueries)[0]) => {
    setQuery(q.query);
    setSelectedQuery(q);
    setIsOpen(false);
  };

  const handleSubmit = () => {
    const match = nlQueries.find(q => 
      q.query.toLowerCase().includes(query.toLowerCase()) || 
      query.toLowerCase().includes(q.query.toLowerCase().split(' ').slice(0, 3).join(' '))
    );
    if (match) {
      setSelectedQuery(match);
      setIsOpen(false);
    }
  };

  const suggestions = query.length > 0 
    ? nlQueries.filter(q => q.query.toLowerCase().includes(query.toLowerCase()))
    : nlQueries;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative flex items-center">
        <svg className="absolute left-3 w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); setSelectedQuery(null); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          placeholder="Ask anything... &quot;Show me delayed shipments&quot;"
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-[#E2E8F0] nl-search-input outline-none transition-all"
          style={{ 
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(0, 212, 170, 0.12)',
          }}
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setSelectedQuery(null); setIsOpen(false); }}
            className="absolute right-3 text-[#64748B] hover:text-[#94A3B8] cursor-pointer"
          >
            ×
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && !selectedQuery && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-1 z-50 glass-card overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="p-2">
              <p className="text-[10px] text-[#64748B] px-2 py-1 uppercase tracking-wider font-medium">
                {query ? 'Matching queries' : 'Try asking...'}
              </p>
              {suggestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(q)}
                  className="w-full text-left px-3 py-2 rounded-md text-xs text-[#94A3B8] hover:text-white hover:bg-[rgba(0,212,170,0.05)] transition-colors cursor-pointer"
                >
                  <span className="text-[#00D4AA] mr-2">→</span>
                  {q.query}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response Panel */}
      <AnimatePresence>
        {selectedQuery && (
          <motion.div
            className="absolute top-full left-0 mt-1 z-50 glass-card"
            style={{ width: '600px', maxHeight: '400px' }}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(0,212,170,0.08)' }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center"
                     style={{ background: 'rgba(0,212,170,0.1)' }}>
                  <span className="text-xs">🤖</span>
                </div>
                <span className="text-xs text-[#00D4AA] font-medium">Supply Radar AI</span>
                {isTyping && <span className="text-[10px] text-[#64748B] ml-auto">analyzing...</span>}
              </div>
              <div className="text-xs text-[#E2E8F0] leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                {typedResponse}
                {isTyping && <span className="typing-cursor" />}
              </div>
              <div className="mt-3 pt-2 flex justify-end" style={{ borderTop: '1px solid rgba(0,212,170,0.08)' }}>
                <button 
                  onClick={() => { setSelectedQuery(null); setQuery(''); }}
                  className="text-[10px] text-[#64748B] hover:text-[#94A3B8] cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
