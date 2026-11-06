import React, { useState } from 'react';
import { Distro } from '../types/distro';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  GitBranch,
  ArrowUpDown,
  Search,
  Scale
} from 'lucide-react';

interface DistroWatchRankingTableProps {
  distros: Distro[];
  onSelectDistro: (distro: Distro) => void;
  onAddToCompare: (distro: Distro) => void;
  comparedIds: string[];
}

export const DistroWatchRankingTable: React.FC<DistroWatchRankingTableProps> = ({
  distros,
  onSelectDistro,
  onAddToCompare,
  comparedIds
}) => {
  const [sortField, setSortField] = useState<'rank' | 'hitsPerDay' | 'name' | 'firstReleaseYear'>('rank');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: 'rank' | 'hitsPerDay' | 'name' | 'firstReleaseYear') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'name' || field === 'rank');
    }
  };

  const sortedDistros = [...distros].sort((a, b) => {
    let res = 0;
    if (sortField === 'rank') res = a.rank - b.rank;
    else if (sortField === 'hitsPerDay') res = b.hitsPerDay - a.hitsPerDay;
    else if (sortField === 'firstReleaseYear') res = a.firstReleaseYear - b.firstReleaseYear;
    else if (sortField === 'name') res = a.name.localeCompare(b.name);
    return sortAsc ? res : -res;
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 p-4 sm:p-6 overflow-hidden">
      {/* Table Title and DistroWatch Context */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            DistroWatch Page Hit Ranking (HPD)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time scraped popularity rankings, page hits per day, lineage ancestry, and package managers.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {sortedDistros.length} distributions
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-900/50 shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-mono sticky top-0 z-10 border-b border-slate-800 backdrop-blur-md">
            <tr>
              <th
                onClick={() => handleSort('rank')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Rank</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Distribution</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th
                onClick={() => handleSort('hitsPerDay')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Hits / Day</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 font-semibold hidden md:table-cell">
                Lineage / Base
              </th>

              <th className="py-3 px-4 font-semibold hidden lg:table-cell">
                Desktop Environments
              </th>

              <th className="py-3 px-4 font-semibold hidden sm:table-cell">
                Package Manager
              </th>

              <th
                onClick={() => handleSort('firstReleaseYear')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors hidden sm:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Inception</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 text-right font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 font-sans">
            {sortedDistros.map((distro) => {
              const isCompared = comparedIds.includes(distro.id);

              return (
                <tr
                  key={distro.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Rank & Trend */}
                  <td className="py-3 px-4 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">
                        #{distro.rank}
                      </span>
                      {distro.trend === 'up' && (
                        <span title="Trending Up"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /></span>
                      )}
                      {distro.trend === 'down' && (
                        <span title="Trending Down"><TrendingDown className="w-3.5 h-3.5 text-rose-400" /></span>
                      )}
                      {distro.trend === 'steady' && (
                        <span title="Steady"><Minus className="w-3.5 h-3.5 text-slate-400" /></span>
                      )}
                    </div>
                  </td>

                  {/* Name & Tagline */}
                  <td className="py-3 px-4">
                    <div
                      onClick={() => onSelectDistro(distro)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: distro.brandColor }}
                        />
                        <span className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                          {distro.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({distro.countryCode})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-xs sm:max-w-md">
                        {distro.tagline}
                      </p>
                    </div>
                  </td>

                  {/* Hits Per Day */}
                  <td className="py-3 px-4 font-mono font-medium text-slate-200">
                    {distro.hitsPerDay.toLocaleString()}
                  </td>

                  {/* Lineage / Base */}
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="text-slate-300 font-mono text-[11px]">
                      {distro.family}
                    </span>
                    <span className="text-slate-400 text-[10px] block">
                      {distro.basedOn.join(', ')}
                    </span>
                  </td>

                  {/* Desktop */}
                  <td className="py-3 px-4 hidden lg:table-cell text-slate-300">
                    <div className="line-clamp-1 max-w-[200px]">
                      {distro.desktopEnvironments.join(', ')}
                    </div>
                  </td>

                  {/* Package Manager */}
                  <td className="py-3 px-4 hidden sm:table-cell font-mono text-cyan-400">
                    {distro.packageManager}
                  </td>

                  {/* Inception Year */}
                  <td className="py-3 px-4 hidden sm:table-cell font-mono text-slate-400">
                    {distro.firstReleaseYear}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onAddToCompare(distro)}
                        title="Compare Distro"
                        className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${
                          isCompared ? 'text-cyan-400' : 'text-slate-400'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onSelectDistro(distro)}
                        title="View Lineage Tree"
                        className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={distro.distroWatchUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Open DistroWatch Profile"
                        className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
