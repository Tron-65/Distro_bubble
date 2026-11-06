import React, { forwardRef } from 'react';
import { Distro, RankingHistoryPoint } from '../types/distro';
import { getDistroRankingHistory } from '../data/rankingHistory';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Award, Activity, TrendingUp, TrendingDown, Minus, ShieldCheck } from 'lucide-react';

interface DistroExportCardProps {
  distro: Distro;
}

export const DistroExportCard = forwardRef<HTMLDivElement, DistroExportCardProps>(
  ({ distro }, ref) => {
    const historyData: RankingHistoryPoint[] = getDistroRankingHistory(distro);

    const ranks = historyData.map((d) => d.rank);
    const hpds = historyData.map((d) => d.hitsPerDay);
    const bestRank = Math.min(...ranks);
    const worstRank = Math.max(...ranks);
    const avgHpd = Math.round(hpds.reduce((a, b) => a + b, 0) / hpds.length);
    const netRankDelta = ranks[0] - ranks[ranks.length - 1];

    const minDomain = Math.max(1, bestRank - 2);
    const maxDomain = worstRank + 2;
    const chartColor = distro.accentColor || distro.brandColor || '#38bdf8';

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return (
      <div
        ref={ref}
        style={{ width: '800px', backgroundColor: '#090d16', color: '#f8fafc' }}
        className="p-8 rounded-2xl border border-slate-800 shadow-2xl font-sans"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg border border-white/20 shrink-0"
              style={{ backgroundColor: distro.brandColor }}
            >
              {distro.logoGlyph}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {distro.name}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                  #{distro.rank} DistroWatch
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {distro.hitsPerDay} HPD
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                {distro.tagline}
              </p>

              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400 font-mono">
                <span>Family: {distro.family}</span>
                <span>·</span>
                <span>Based on: {distro.basedOn.join(', ')}</span>
                <span>·</span>
                <span>Est. {distro.firstReleaseYear}</span>
                <span>·</span>
                <span>Origin: {distro.originCountry}</span>
              </div>
            </div>
          </div>

          <div className="text-right font-mono text-[11px] text-slate-500">
            <span className="text-cyan-400 font-semibold block text-xs">DistroSphere</span>
            <span>DistroWatch Verified Report</span>
          </div>
        </div>

        {/* 12-Month Ranking History Section */}
        <div className="py-6 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                12-Month DistroWatch Ranking History
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Monthly leaderboard rank standing trend (#1 at top)
              </p>
            </div>

            {/* Quick KPI stats */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-amber-300">
                <Award className="w-3.5 h-3.5" />
                <span>Best: #{bestRank}</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-300">
                <Activity className="w-3.5 h-3.5" />
                <span>Avg: {avgHpd} HPD</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                {netRankDelta > 0 ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{netRankDelta} spots</span>
                  </>
                ) : netRankDelta < 0 ? (
                  <>
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>{netRankDelta} spots</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-3.5 h-3.5" />
                    <span>Steady</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Recharts Line Chart for Export (width 736px, height 180px) */}
          <div className="w-full h-44 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <LineChart
              width={710}
              height={155}
              data={historyData}
              margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148, 163, 184, 0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis
                reversed
                domain={[minDomain, maxDomain]}
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `#${val}`}
                fontFamily="JetBrains Mono, monospace"
              />
              <Line
                type="monotone"
                dataKey="rank"
                stroke={chartColor}
                strokeWidth={2.5}
                isAnimationActive={false}
                dot={{
                  r: 3,
                  fill: '#090d16',
                  stroke: chartColor,
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </div>
        </div>

        {/* Technical Specifications Matrix */}
        <div className="py-6">
          <h2 className="text-sm font-semibold text-white mb-3">
            Operating System Specifications
          </h2>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Package Manager</span>
              <span className="font-mono font-semibold text-cyan-400">{distro.packageManager}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Release Model</span>
              <span className="font-mono font-semibold text-slate-200">{distro.releaseModel}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Init System</span>
              <span className="font-mono font-semibold text-slate-200">{distro.initSystem}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Default Filesystem</span>
              <span className="font-mono font-semibold text-slate-200">{distro.defaultFs}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Min Recommended RAM</span>
              <span className="font-mono font-semibold text-slate-200">{distro.minRamGb} GB</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Default Desktops</span>
              <span className="font-medium text-slate-200 truncate max-w-[200px]">
                {distro.desktopEnvironments.join(', ')}
              </span>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
            <span className="text-slate-400 font-mono block mb-1">Install Command:</span>
            <code className="text-emerald-300 font-mono text-[11px] block bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
              $ {distro.packageInstallCmd}
            </code>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Generated via DistroSphere · Data source: https://distrowatch.com</span>
          <span>Report date: {currentDate}</span>
        </div>
      </div>
    );
  }
);

DistroExportCard.displayName = 'DistroExportCard';
