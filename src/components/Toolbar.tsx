import React from 'react';
import { ClusterMode, DistroFamily } from '../types/distro';
import { Search, SlidersHorizontal, Orbit, GitBranch, Layers, Box, Compass, Sparkles, Clock } from 'lucide-react';

interface ToolbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedFamily: DistroFamily | 'All';
  setSelectedFamily: (f: DistroFamily | 'All') => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  clusterMode: ClusterMode;
  setClusterMode: (m: ClusterMode) => void;
  activeView: 'bubbles' | 'rankings' | 'lineage';
  setActiveView: (view: 'bubbles' | 'rankings' | 'lineage') => void;
  totalFilteredCount: number;
  onOpenMatchmaker: () => void;
  isEvolutionActive: boolean;
  onToggleEvolution: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedFamily,
  setSelectedFamily,
  selectedCategory,
  setSelectedCategory,
  clusterMode,
  setClusterMode,
  activeView,
  setActiveView,
  totalFilteredCount,
  onOpenMatchmaker,
  isEvolutionActive,
  onToggleEvolution
}) => {
  const families: (DistroFamily | 'All')[] = [
    'All',
    'Debian',
    'Ubuntu',
    'Arch',
    'Red Hat / Fedora',
    'Slackware / SUSE',
    'Independent'
  ];

  const categories = [
    'All Categories',
    'Beginner',
    'Desktop',
    'Gaming',
    'Security & Forensics',
    'Server',
    'Lightweight',
    'Immutable / Atomic'
  ];

  return (
    <div className="w-full bg-slate-900/80 border-b border-slate-800/80 px-4 sm:px-6 py-2.5 backdrop-blur-md z-30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Search Bar & Family Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search distro, package, DE..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Family Filter Segments */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs overflow-x-auto max-w-full">
            {families.map((fam) => (
              <button
                key={fam}
                onClick={() => setSelectedFamily(fam)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                  selectedFamily === fam
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {fam}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Bubble Cluster Physics Modes & View Switcher (for small screens) */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          {activeView === 'bubbles' && (
            <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <span className="px-2 text-[11px] text-slate-400 font-mono hidden lg:inline">
                Cluster:
              </span>

              <button
                onClick={() => setClusterMode('family')}
                title="Cluster by Lineage Family"
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  clusterMode === 'family'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitBranch className="w-3 h-3" />
                <span className="hidden sm:inline">Family Tree</span>
              </button>

              <button
                onClick={() => setClusterMode('rank')}
                title="Orbit by DistroWatch Rank"
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  clusterMode === 'rank'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Orbit className="w-3 h-3" />
                <span className="hidden sm:inline">Rank Spiral</span>
              </button>

              <button
                onClick={() => setClusterMode('packageManager')}
                title="Group by Package Manager (APT, Pacman, DNF, etc.)"
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  clusterMode === 'packageManager'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Box className="w-3 h-3" />
                <span className="hidden sm:inline">Package Mgr</span>
              </button>

              <button
                onClick={() => setClusterMode('free')}
                title="Free Organic Drift Physics"
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  clusterMode === 'free'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3 h-3" />
                <span className="hidden sm:inline">Free Float</span>
              </button>
            </div>
          )}

          {/* Dynamic Exploration Tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenMatchmaker}
              title="Take a 3-step quiz to find your ideal Linux distribution"
              className="px-2.5 py-1.5 bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-700/60 text-cyan-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Matchmaker</span>
            </button>

            <button
              onClick={onToggleEvolution}
              title="Play the evolutionary timeline from 1991 to 2026"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                isEvolutionActive
                  ? 'bg-cyan-500 text-slate-950 font-semibold border-cyan-400 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline (1991-2026)</span>
            </button>
          </div>

          {/* Active distros counter */}
          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap hidden sm:inline">
            {totalFilteredCount} distros
          </span>
        </div>
      </div>
    </div>
  );
};
