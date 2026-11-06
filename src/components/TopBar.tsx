import React from 'react';
import { Sparkles, Scale, RefreshCw } from 'lucide-react';

interface TopBarProps {
  activeView: 'bubbles' | 'rankings' | 'lineage';
  setActiveView: (view: 'bubbles' | 'rankings' | 'lineage') => void;
  onRandomDistro: () => void;
  compareCount: number;
  onOpenCompare: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  setActiveView,
  onRandomDistro,
  compareCount,
  onOpenCompare
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark (no subtext or pill island) */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setActiveView('bubbles');
        }}
        className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
        <span>DistroSphere</span>
      </a>

      {/* Zone 2: 4-5 concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveView('bubbles')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'bubbles' ? 'text-white border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Bubble Universe
        </button>

        <button
          onClick={() => setActiveView('rankings')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'rankings' ? 'text-white border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          DistroWatch Top 100
        </button>

        <button
          onClick={() => setActiveView('lineage')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'lineage' ? 'text-white border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Lineage Trees
        </button>

        {compareCount > 0 && (
          <button
            onClick={onOpenCompare}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-cyan-400 font-semibold"
          >
            Compare ({compareCount})
          </button>
        )}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onRandomDistro}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Random Distro</span>
        </button>
      </div>
    </header>
  );
};
