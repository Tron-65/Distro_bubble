import React, { useState, useMemo } from 'react';
import { Distro, RankingHistoryPoint } from '../types/distro';
import { getDistroRankingHistory } from '../data/rankingHistory';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Activity,
  Calendar,
  BarChart2
} from 'lucide-react';

interface DistroRankingChartProps {
  distro: Distro;
}

export const DistroRankingChart: React.FC<DistroRankingChartProps> = ({ distro }) => {
  const [metricMode, setMetricMode] = useState<'rank' | 'hpd' | 'dual'>('rank');

  const historyData: RankingHistoryPoint[] = useMemo(() => {
    return getDistroRankingHistory(distro);
  }, [distro]);

  // Compute 12-month summary statistics
  const stats = useMemo(() => {
    const ranks = historyData.map((d) => d.rank);
    const hpds = historyData.map((d) => d.hitsPerDay);

    const bestRank = Math.min(...ranks);
    const worstRank = Math.max(...ranks);
    const avgHpd = Math.round(hpds.reduce((a, b) => a + b, 0) / hpds.length);

    const firstRank = ranks[0];
    const latestRank = ranks[ranks.length - 1];
    // In rankings, lower number = better rank
    const netRankDelta = firstRank - latestRank;

    const firstHpd = hpds[0];
    const latestHpd = hpds[hpds.length - 1];
    const netHpdDelta = latestHpd - firstHpd;

    return {
      bestRank,
      worstRank,
      avgHpd,
      netRankDelta,
      netHpdDelta
    };
  }, [historyData]);

  // Compute Y-Axis bounds for rank
  const rankYDomain = useMemo(() => {
    const min = Math.max(1, stats.bestRank - 2);
    const max = stats.worstRank + 2;
    return [min, max];
  }, [stats]);

  // Primary chart stroke color
  const chartColor = distro.accentColor || distro.brandColor || '#38bdf8';

  return (
    <div className="space-y-4">
      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 block mb-1">Current Position</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-base font-bold text-white">
              #{distro.rank}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({distro.hitsPerDay} HPD)
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 block mb-1">12-Mo Best Rank</span>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono text-base font-bold text-amber-300">
              #{stats.bestRank}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 block mb-1">12-Mo Average Traffic</span>
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-mono text-base font-bold text-slate-100">
              {stats.avgHpd.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">HPD</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 block mb-1">12-Mo Trajectory</span>
          <div className="flex items-center gap-1.5">
            {stats.netRankDelta > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-base font-bold text-emerald-400">
                  +{stats.netRankDelta} spots
                </span>
              </>
            ) : stats.netRankDelta < 0 ? (
              <>
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span className="font-mono text-base font-bold text-rose-400">
                  {stats.netRankDelta} spots
                </span>
              </>
            ) : (
              <>
                <Minus className="w-4 h-4 text-slate-400" />
                <span className="font-mono text-base font-bold text-slate-300">
                  Steady
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chart Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900/70 border border-slate-800">
        {/* Metric Selector & Subtitle */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>DistroWatch 12-Month Popularity Trend</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Monthly tracking of ranking leaderboard standing and daily page hits.
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setMetricMode('rank')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                metricMode === 'rank'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rank Position (#)
            </button>
            <button
              onClick={() => setMetricMode('hpd')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                metricMode === 'hpd'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Page Hits / Day
            </button>
            <button
              onClick={() => setMetricMode('dual')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                metricMode === 'dual'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dual Trend
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            {metricMode === 'rank' ? (
              // RANK POSITION (Reversed Y-Axis so #1 is at top)
              <LineChart
                data={historyData}
                margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148, 163, 184, 0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                  fontFamily="JetBrains Mono, monospace"
                />
                <YAxis
                  reversed
                  domain={rankYDomain}
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `#${val}`}
                  fontFamily="JetBrains Mono, monospace"
                />
                <Tooltip content={<CustomRankTooltip />} />
                <Line
                  type="monotone"
                  dataKey="rank"
                  name="DistroWatch Rank"
                  stroke={chartColor}
                  strokeWidth={2.5}
                  dot={{
                    r: 3.5,
                    fill: '#0f172a',
                    stroke: chartColor,
                    strokeWidth: 2
                  }}
                  activeDot={{
                    r: 6,
                    fill: chartColor,
                    stroke: '#ffffff',
                    strokeWidth: 2
                  }}
                  animationDuration={800}
                />
              </LineChart>
            ) : metricMode === 'hpd' ? (
              // HITS PER DAY AREA CHART
              <AreaChart
                data={historyData}
                margin={{ top: 15, right: 15, left: 5, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="hpdGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148, 163, 184, 0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                  fontFamily="JetBrains Mono, monospace"
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
                  fontFamily="JetBrains Mono, monospace"
                />
                <Tooltip content={<CustomHpdTooltip />} />
                <Area
                  type="monotone"
                  dataKey="hitsPerDay"
                  name="Hits Per Day"
                  stroke={chartColor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#hpdGradient)"
                  dot={{
                    r: 3.5,
                    fill: '#0f172a',
                    stroke: chartColor,
                    strokeWidth: 2
                  }}
                  activeDot={{
                    r: 6,
                    fill: chartColor,
                    stroke: '#ffffff',
                    strokeWidth: 2
                  }}
                  animationDuration={800}
                />
              </AreaChart>
            ) : (
              // DUAL AXIS TREND (Rank on Left reversed, HPD on Right)
              <LineChart
                data={historyData}
                margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148, 163, 184, 0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                  fontFamily="JetBrains Mono, monospace"
                />
                <YAxis
                  yAxisId="left"
                  reversed
                  domain={rankYDomain}
                  stroke="#38bdf8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `#${val}`}
                  fontFamily="JetBrains Mono, monospace"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#34d399"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
                  fontFamily="JetBrains Mono, monospace"
                />
                <Tooltip content={<CustomDualTooltip />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rank"
                  name="Rank"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#0f172a', stroke: '#38bdf8', strokeWidth: 2 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="hitsPerDay"
                  name="Hits/Day"
                  stroke="#34d399"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#0f172a', stroke: '#34d399', strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend / Info footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            {metricMode === 'rank' && (
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: chartColor }}
                />
                <span>Rank Scale: Higher position (#1) plotted at top</span>
              </span>
            )}
            {metricMode === 'hpd' && (
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: chartColor }}
                />
                <span>HPD: Average page hits recorded daily on DistroWatch</span>
              </span>
            )}
            {metricMode === 'dual' && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>Rank Position (Left)</span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Hits / Day (Right)</span>
                </span>
              </div>
            )}
          </div>

          <span>Data source: DistroWatch Hit Page Rankings</span>
        </div>
      </div>
    </div>
  );
};

// Tooltip for Rank Mode
const CustomRankTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data: RankingHistoryPoint = payload[0].payload;
    return (
      <div className="p-2.5 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl text-xs font-mono">
        <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">
          {data.month}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold text-sm">
            Rank #{data.rank}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-300">{data.hitsPerDay} HPD</span>
        </div>
      </div>
    );
  }
  return null;
};

// Tooltip for HPD Mode
const CustomHpdTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data: RankingHistoryPoint = payload[0].payload;
    return (
      <div className="p-2.5 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl text-xs font-mono">
        <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">
          {data.month}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold text-sm">
            {data.hitsPerDay.toLocaleString()} Hits / Day
          </span>
        </div>
        <div className="text-slate-400 text-[11px] mt-0.5">
          Leaderboard position: #{data.rank}
        </div>
      </div>
    );
  }
  return null;
};

// Tooltip for Dual Mode
const CustomDualTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data: RankingHistoryPoint = payload[0].payload;
    return (
      <div className="p-2.5 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl text-xs font-mono">
        <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">
          {data.month}
        </div>
        <div className="text-cyan-400 font-bold">
          Rank: #{data.rank}
        </div>
        <div className="text-emerald-400 font-bold">
          Traffic: {data.hitsPerDay.toLocaleString()} HPD
        </div>
      </div>
    );
  }
  return null;
};
