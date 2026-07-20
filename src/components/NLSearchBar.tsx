'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { nlQueries } from '@/data/demo';
import type { ScenarioImpact } from '@/lib/askEngine';

// Minimal markdown → React: handles **bold**, bullet lines, and blank lines.
function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
      seg.startsWith('**') && seg.endsWith('**')
        ? <strong key={j} className="text-white">{seg.slice(2, -2)}</strong>
        : <span key={j}>{seg}</span>,
    );
    return <div key={i} className={line.trim() === '' ? 'h-2' : 'leading-relaxed'}>{parts}</div>;
  });
}

export default function NLSearchBar({ onScenario }: { onScenario?: (s: ScenarioImpact) => void }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [typed, setTyped] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'ai' | 'heuristic' | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside closes everything
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Typing animation for the answer
  useEffect(() => {
    if (!answer) return;
    setIsTyping(true);
    setTyped('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < answer.length) {
        setTyped(answer.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 6);
    return () => clearInterval(timer);
  }, [answer]);

  const run = async (q: string) => {
    const question = q.trim();
    if (!question) return;
    setIsOpen(false);
    setPanelOpen(true);
    setLoading(true);
    setAnswer('');
    setTyped('');
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setLoading(false);
      setSource(data.source ?? null);
      setAnswer(data.answer || 'No answer returned.');
      if (data.scenario && onScenario) onScenario(data.scenario as ScenarioImpact);
    } catch {
      setLoading(false);
      setAnswer('Search is temporarily unavailable. Please try again.');
    }
  };

  const suggestions = query.length > 0
    ? nlQueries.filter((q) => q.query.toLowerCase().includes(query.toLowerCase()))
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
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Enter') run(query); }}
          placeholder="Ask anything... &quot;What if a typhoon closes the Port of Shanghai?&quot;"
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-[#E2E8F0] nl-search-input outline-none transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0, 212, 170, 0.12)' }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 text-[#64748B] hover:text-[#94A3B8] cursor-pointer"
          >
            ×
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && !panelOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-1 z-[3000] glass-card overflow-hidden"
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
                  onClick={() => { setQuery(q.query); run(q.query); }}
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
        {panelOpen && (
          <motion.div
            className="absolute top-full left-0 mt-1 z-[3000] glass-card"
            style={{ width: '600px', maxWidth: '90vw', maxHeight: '440px' }}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(0,212,170,0.08)' }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(0,212,170,0.1)' }}>
                  <span className="text-xs">🤖</span>
                </div>
                <span className="text-xs text-[#00D4AA] font-medium">Supply Radar AI</span>
                {source && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide"
                    style={{ background: source === 'ai' ? 'rgba(0,212,170,0.12)' : 'rgba(148,163,184,0.12)', color: source === 'ai' ? '#00D4AA' : '#94A3B8' }}>
                    {source === 'ai' ? 'live AI' : 'instant'}
                  </span>
                )}
                {(loading || isTyping) && <span className="text-[10px] text-[#64748B] ml-auto">analyzing...</span>}
              </div>

              <div className="text-xs text-[#E2E8F0] max-h-[320px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center gap-2 text-[#94A3B8] py-4">
                    <div className="w-4 h-4 rounded-full border-2 border-[#00D4AA] border-t-transparent animate-spin" />
                    Running query against live supply-chain data...
                  </div>
                ) : (
                  <div>
                    {renderMarkdown(typed)}
                    {isTyping && <span className="typing-cursor" />}
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 flex justify-end" style={{ borderTop: '1px solid rgba(0,212,170,0.08)' }}>
                <button
                  onClick={() => { setPanelOpen(false); setQuery(''); setAnswer(''); setTyped(''); setSource(null); }}
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
