import React, { useState } from 'react';
import { Distro, DistroFamily } from '../types/distro';
import { DISTROS_DATA, PRIMORDIAL_NODES } from '../data/distros';
import { GitBranch, GitFork, ChevronRight, Sparkles } from 'lucide-react';

interface LineageGraphViewProps {
  onSelectDistro: (distro: Distro) => void;
  selectedDistro: Distro | null;
}

export const LineageGraphView: React.FC<LineageGraphViewProps> = ({
  onSelectDistro,
  selectedDistro
}) => {
  const [activeFamily, setActiveFamily] = useState<DistroFamily | 'All'>('All');

  const families: { key: DistroFamily; label: string; rootDesc: string; color: string }[] = [
    {
      key: 'Debian',
      label: 'Debian Ecosystem',
      rootDesc: 'Debian (1993) -> Foundation of stability and the universal operating system.',
      color: '#d70a53'
    },
    {
      key: 'Ubuntu',
      label: 'Ubuntu Family',
      rootDesc: 'Ubuntu (2004) -> Linux for Human Beings, spawning Mint, Pop!_OS, elementary.',
      color: '#e95420'
    },
    {
      key: 'Arch',
      label: 'Arch Linux Lineage',
      rootDesc: 'Arch (2002) -> Bleeding edge rolling releases, AUR, and SteamOS.',
      color: '#1793d1'
    },
    {
      key: 'Red Hat / Fedora',
      label: 'Red Hat & Fedora Tree',
      rootDesc: 'Red Hat (1994) & Fedora (2003) -> Enterprise RPM bedrock, Rocky, Alma, Atomic.',
      color: '#294172'
    },
    {
      key: 'Slackware / SUSE',
      label: 'Slackware & openSUSE Branch',
      rootDesc: 'Slackware (1993) & SUSE (1994) -> Historic UNIX purity and YaST engineering.',
      color: '#73ba25'
    },
    {
      key: 'Independent',
      label: 'Independent & Source-Based',
      rootDesc: 'NixOS, Alpine, Void, Gentoo -> Novel declarative, musl, and source architectures.',
      color: '#5277c3'
    }
  ];

  const filteredFamilies = activeFamily === 'All'
    ? families
    : families.filter((f) => f.key === activeFamily);

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 p-4 sm:p-6 overflow-y-auto">
      {/* Title & Family Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Linux Evolutionary Lineage Trees
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore the genealogical origins, primary roots, and downstream forks of each major Linux family tree.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveFamily('All')}
            className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
              activeFamily === 'All'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Families
          </button>
          {families.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFamily(f.key)}
              className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
                activeFamily === f.key
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Primordial Ancestor Banner */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-slate-200 font-bold">UNIX (1969)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-cyan-300 font-bold">Linux Kernel (1991)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-400">Distribution Branches: Debian, Red Hat, Arch, Slackware, Independent</span>
        </div>

        <span className="text-[11px] text-slate-400">
          Click any distribution node below to inspect lineage & specs
        </span>
      </div>

      {/* Family Sections */}
      <div className="space-y-8">
        {filteredFamilies.map((fam) => {
          const distrosInFamily = DISTROS_DATA.filter((d) => d.family === fam.key);

          // Group by direct base or level
          const directRoots = distrosInFamily.filter(
            (d) => d.parentId === 'linux' || d.parentId === 'unix' || d.parentId === 'redhat' || d.parentId === 'suse'
          );

          // Sub-derivatives (children of these roots)
          const derivatives = distrosInFamily.filter(
            (d) => !directRoots.some((r) => r.id === d.id)
          );

          return (
            <div
              key={fam.key}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: fam.color }}
                  />
                  <h3 className="font-bold text-base text-white">
                    {fam.label}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    ({distrosInFamily.length} distros)
                  </span>
                </div>

                <p className="text-xs text-slate-400 hidden sm:block max-w-md text-right">
                  {fam.rootDesc}
                </p>
              </div>

              {/* Distro Nodes Grid in this Family */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {distrosInFamily.map((distro) => {
                  const isSelected = selectedDistro?.id === distro.id;

                  return (
                    <div
                      key={distro.id}
                      onClick={() => onSelectDistro(distro)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                          : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: distro.brandColor }}
                            />
                            <span className="font-semibold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors">
                              {distro.name}
                            </span>
                          </div>
                          <span className="font-mono text-xs text-cyan-400 font-semibold">
                            #{distro.rank}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {distro.tagline}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Est. {distro.firstReleaseYear}</span>
                        <span>{distro.packageManager}</span>
                        <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                          Tree &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
