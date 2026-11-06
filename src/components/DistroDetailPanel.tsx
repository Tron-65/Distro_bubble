import React, { useState, useRef } from 'react';
import { Distro } from '../types/distro';
import { LineageTree } from './LineageTree';
import { DistroRankingChart } from './DistroRankingChart';
import { DistroExportCard } from './DistroExportCard';
import { DistroUserNotes } from './DistroUserNotes';
import { toPng } from 'html-to-image';
import {
  X,
  ExternalLink,
  GitBranch,
  Terminal,
  Cpu,
  Layers,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  BookOpen,
  MessageSquare,
  Sparkles,
  Scale,
  LineChart as LineChartIcon,
  Download,
  Loader2,
  FileText,
  Calendar,
  Monitor,
  Package
} from 'lucide-react';

interface DistroDetailPanelProps {
  distro: Distro | null;
  onClose: () => void;
  onSelectDistro: (distro: Distro) => void;
  onAddToCompare: (distro: Distro) => void;
  isCompared: boolean;
}

export const DistroDetailPanel: React.FC<DistroDetailPanelProps> = ({
  distro,
  onClose,
  onSelectDistro,
  onAddToCompare,
  isCompared
}) => {
  const [activeTab, setActiveTab] = useState<'lineage' | 'trend' | 'overview' | 'specs' | 'terminal' | 'notes'>('lineage');
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const exportCardRef = useRef<HTMLDivElement>(null);

  // Check if this distro has saved notes in localStorage
  const hasSavedNotes = distro
    ? Boolean(localStorage.getItem(`distrosphere_user_notes_${distro.id}`))
    : false;

  if (!distro) return null;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(distro.packageInstallCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleExportPng = async () => {
    if (!exportCardRef.current || !distro) return;
    try {
      setIsExporting(true);
      // Brief stabilization for SVG/font rendering
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dataUrl = await toPng(exportCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#090d16'
      });

      const link = document.createElement('a');
      link.download = `${distro.id}-distrowatch-specsheet.png`;
      link.href = dataUrl;
      link.click();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to export PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header Banner */}
        <div className="relative p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950">
          {/* Subtle colored accent glow in corner based on distro brand color */}
          <div
            className="absolute top-0 right-0 w-80 h-32 opacity-20 blur-3xl pointer-events-none"
            style={{ backgroundColor: distro.brandColor }}
          />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Monogram Glyph Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/10 shrink-0"
                style={{ backgroundColor: distro.brandColor }}
              >
                {distro.logoGlyph}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {distro.name}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                    #{distro.rank} on DistroWatch
                  </span>
                  <button
                    onClick={() => setActiveTab('trend')}
                    className="text-xs px-2 py-0.5 rounded font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Click to view 12-month ranking trend"
                  >
                    {distro.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                    {distro.trend === 'down' && <TrendingDown className="w-3 h-3 text-rose-400" />}
                    {distro.trend === 'steady' && <Minus className="w-3 h-3 text-slate-400" />}
                    <span>{distro.hitsPerDay} HPD · 12-Mo Trend &rarr;</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  {distro.tagline}
                </p>

                {/* Clean unboxed metadata with bullet separators */}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400 font-medium">
                  <span>Based on: {distro.basedOn.join(', ')}</span>
                  <span aria-hidden="true">·</span>
                  <span>Origin: {distro.originCountry}</span>
                  <span aria-hidden="true">·</span>
                  <span>Est. {distro.firstReleaseYear}</span>
                  <span aria-hidden="true">·</span>
                  <span>v{distro.latestVersion}</span>
                </div>
              </div>
            </div>

            {/* Action buttons (Export PNG, Compare & Close) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportPng}
                disabled={isExporting}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                  exportSuccess
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white'
                }`}
                title="Export specifications and 12-month ranking trend as high-res PNG"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Generating PNG...</span>
                  </>
                ) : exportSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Exported PNG!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Export PNG</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onAddToCompare(distro)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                  isCompared
                    ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{isCompared ? 'In Compare' : 'Compare'}</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Facts Summary Grid Section */}
          <div className="mt-4 pt-3.5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <span>Quick Facts</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                Key Metrics Snapshot
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
              {/* Fact 1: Release Year */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">
                  <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">Release Year</span>
                </div>
                <span className="font-mono font-semibold text-xs sm:text-sm text-slate-100 truncate">
                  {distro.firstReleaseYear}
                </span>
              </div>

              {/* Fact 2: Origin Country */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">
                  <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">Origin</span>
                </div>
                <span className="font-semibold text-xs sm:text-sm text-slate-100 truncate" title={distro.originCountry}>
                  {distro.originCountry}
                </span>
              </div>

              {/* Fact 3: Default Desktop */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">
                  <Monitor className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="truncate">Default Desktop</span>
                </div>
                <span className="font-semibold text-xs sm:text-sm text-slate-100 truncate" title={distro.desktopEnvironments.join(', ')}>
                  {distro.desktopEnvironments[0] || 'Custom'}
                </span>
              </div>

              {/* Fact 4: Base Lineage */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">
                  <GitBranch className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">Base Lineage</span>
                </div>
                <span className="font-mono font-semibold text-xs sm:text-sm text-slate-100 truncate" title={distro.basedOn.join(', ')}>
                  {distro.basedOn[0] || distro.family}
                </span>
              </div>

              {/* Fact 5: Package Manager */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">
                  <Package className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="truncate">Package Mgr</span>
                </div>
                <span className="font-mono font-semibold text-xs sm:text-sm text-cyan-400 truncate">
                  {distro.packageManager}
                </span>
              </div>

              {/* Fact 6: Release Model */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">
                  <Layers className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="truncate">Release Model</span>
                </div>
                <span className="font-mono font-semibold text-xs sm:text-sm text-slate-100 truncate">
                  {distro.releaseModel}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('lineage')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'lineage'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Lineage & Origin Tree</span>
            </button>

            <button
              onClick={() => setActiveTab('trend')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'trend'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>12-Mo Ranking Trend</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>DistroWatch Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'specs'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Technical Specifications</span>
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'terminal'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Package Manager & CLI</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>User Notes</span>
              {hasSavedNotes && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Contains saved personal notes" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/60">
          {/* TAB 1: LINEAGE & ORIGIN TREE */}
          {activeTab === 'lineage' && (
            <LineageTree
              distro={distro}
              onSelectDistro={onSelectDistro}
            />
          )}

          {/* TAB 2: 12-MONTH RANKING TREND CHART (RECHARTS) */}
          {activeTab === 'trend' && (
            <DistroRankingChart distro={distro} />
          )}

          {/* TAB 3: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-3xl">
              {/* Quick 12-Mo Trend Preview Teaser Card */}
              <div
                onClick={() => setActiveTab('trend')}
                className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
                      <LineChartIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        DistroWatch 12-Month Ranking Trend
                      </h4>
                      <p className="text-xs text-slate-400">
                        Rank #{distro.rank} · {distro.hitsPerDay} hits/day · Click to visualize interactive Recharts history
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Chart &rarr;
                  </span>
                </div>
              </div>

              {/* User Notes Quick Teaser Card */}
              <div
                onClick={() => setActiveTab('notes')}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        Personal Notes & Hardware Test Logs
                      </h4>
                      <p className="text-xs text-slate-400">
                        {hasSavedNotes
                          ? 'You have saved notes and personal ratings for this distro.'
                          : 'Save persistent installation notes, hardware test logs, and personal ratings.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {hasSavedNotes ? 'Edit Notes &rarr;' : 'Write Notes &rarr;'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  DistroWatch Summary
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {distro.description}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  Core Philosophy & Trait
                </h3>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-300 leading-relaxed">
                  {distro.philosophy}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                    Target Categories
                  </span>
                  <div className="text-sm text-white font-medium">
                    {distro.category.join(' · ')}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                    Available Desktops
                  </span>
                  <div className="text-sm text-white font-medium">
                    {distro.desktopEnvironments.join(', ')}
                  </div>
                </div>
              </div>

              {/* Official Links */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">
                  External Links & Resources
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={distro.distroWatchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span>DistroWatch Page</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
                  </a>

                  <a
                    href={distro.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>Official Website</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
                  </a>

                  {distro.docsUrl && (
                    <a
                      href={distro.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                        <BookOpen className="w-4 h-4 text-purple-400" />
                        <span>Documentation & Guides</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400" />
                    </a>
                  )}

                  {distro.forumUrl && (
                    <a
                      href={distro.forumUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                        <MessageSquare className="w-4 h-4 text-amber-400" />
                        <span>Community Forums</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TECHNICAL SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="text-sm font-semibold text-white mb-2">
                Operating System Architecture Specs
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Release Model</span>
                  <span className="font-semibold text-slate-200 font-mono">{distro.releaseModel}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Package Manager</span>
                  <span className="font-semibold text-cyan-400 font-mono">{distro.packageManager}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Init System</span>
                  <span className="font-semibold text-slate-200 font-mono">{distro.initSystem}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Default Filesystem</span>
                  <span className="font-semibold text-slate-200 font-mono">{distro.defaultFs}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Minimum Recommended RAM</span>
                  <span className="font-semibold text-slate-200 font-mono">{distro.minRamGb} GB</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Family Tree Lineage</span>
                  <span className="font-semibold text-purple-300 font-mono">{distro.family}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mt-4">
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                  Supported CPU Architectures
                </span>
                <div className="flex flex-wrap gap-2">
                  {distro.architectures.map((arch) => (
                    <span
                      key={arch}
                      className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-300"
                    >
                      {arch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TERMINAL & PACKAGE COMMAND */}
          {activeTab === 'terminal' && (
            <div className="space-y-4 max-w-3xl">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Terminal Package Installation Command
                </h3>
                <p className="text-xs text-slate-400">
                  How packages and system updates are installed in {distro.name} via CLI:
                </p>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                {/* Terminal Titlebar */}
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-slate-400">{distro.id}@linux:~</span>
                  </div>

                  <button
                    onClick={handleCopyCmd}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedCmd ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Terminal Body */}
                <div className="p-4 font-mono text-sm space-y-2 text-slate-200">
                  <div className="text-slate-400 text-xs">
                    # Update repositories & install software
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 select-none">$</span>
                    <span className="text-emerald-300">{distro.packageInstallCmd}</span>
                  </div>

                  <div className="pt-2 text-slate-400 text-xs">
                    # Package manager: <span className="text-slate-300">{distro.packageManager}</span>
                  </div>
                </div>
              </div>

              {/* Package manager notes */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-white block mb-1">
                  Ecosystem Notes for {distro.packageManager}:
                </span>
                {distro.packageManager === 'apt' && (
                  <p>
                    APT (Advanced Package Tool) utilizes Debian .deb archive binaries with dpkg. Software is distributed via high-security signed mirrors with automatic dependency resolution.
                  </p>
                )}
                {distro.packageManager === 'pacman' && (
                  <p>
                    Pacman is the high-performance package manager designed for Arch Linux. Complemented by the community Arch User Repository (AUR) with thousands of PKGBUILD build recipes.
                  </p>
                )}
                {distro.packageManager === 'dnf' && (
                  <p>
                    DNF (Dandified YUM) is the next-generation RPM package manager powering Fedora and RHEL. Built with librepo and libsolv for ultra-reliable dependency SAT solving.
                  </p>
                )}
                {distro.packageManager === 'zypper' && (
                  <p>
                    Zypper is the command-line interface for the ZYpp system management library in openSUSE, famous for rapid SAT-solver dependency calculation and pattern installations.
                  </p>
                )}
                {distro.packageManager === 'nix' && (
                  <p>
                    Nix is a purely functional package manager. It treats packages like mathematical values in a functional language: immutable, reproducible, and stored in hashed /nix/store directories.
                  </p>
                )}
                {distro.packageManager === 'apk' && (
                  <p>
                    Alpine Package Keeper (APK) is engineered for hyper-minimal container environments. It installs packages in fractions of a second with negligible CPU and memory overhead.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: USER NOTES (LOCALSTORAGE PERSISTENT) */}
          {activeTab === 'notes' && (
            <DistroUserNotes distro={distro} />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>DistroWatch Hit Page Ranking:</span>
            <span className="font-mono font-semibold text-white">#{distro.rank}</span>
            <span>({distro.hitsPerDay} hits/day)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPng}
              disabled={isExporting}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              title="Download distribution specifications & 12-month ranking trend as high-res PNG image"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Exporting PNG...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download Spec Sheet (PNG)</span>
                </>
              )}
            </button>

            <a
              href={distro.distroWatchUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>DistroWatch Profile</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Off-screen container for rendering high-resolution PNG image */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0',
          pointerEvents: 'none',
          zIndex: -9999
        }}
      >
        <DistroExportCard ref={exportCardRef} distro={distro} />
      </div>
    </div>
  );
};
