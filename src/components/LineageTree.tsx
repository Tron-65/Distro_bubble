import React, { useState } from 'react';
import { Distro } from '../types/distro';
import {
  getAncestorChain,
  getDirectChildren,
  getSiblings,
  getDistroById,
  AncestorStep
} from '../data/lineageGraph';
import { ArrowRight, GitBranch, GitCommit, GitFork, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface LineageTreeProps {
  distro: Distro;
  onSelectDistro: (distro: Distro) => void;
  className?: string;
}

export const LineageTree: React.FC<LineageTreeProps> = ({
  distro,
  onSelectDistro,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'genealogy' | 'timeline' | 'forks'>('genealogy');

  const ancestors = getAncestorChain(distro.id);
  const children = getDirectChildren(distro.id);
  const siblings = getSiblings(distro);

  return (
    <div className={`flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800 p-5 ${className}`}>
      {/* Tree Header & Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              Genealogical Lineage & Origin Tree
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Tracing evolutionary ancestry from UNIX & Linux Kernel down to {distro.name} and its derivative forks.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('genealogy')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              viewMode === 'genealogy'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Origin Pedigree
          </button>
          <button
            onClick={() => setViewMode('forks')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              viewMode === 'forks'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Forks & Children ({children.length})
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              viewMode === 'timeline'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chronological
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto py-5">
        {viewMode === 'genealogy' && (
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Ancestor Vertical Trail */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-slate-700 before:via-cyan-500 before:to-emerald-500">
              {ancestors.map((step, idx) => {
                const isCurrent = step.id === distro.id;
                const isLastAncestor = idx === ancestors.length - 2;
                const matchingDistro = getDistroById(step.id);

                return (
                  <div key={step.id} className="relative group">
                    {/* Node Dot / Glyph */}
                    <div
                      className={`absolute -left-6 top-1 w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[10px] font-bold transition-all ${
                        isCurrent
                          ? 'bg-cyan-500 border-white text-slate-950 ring-4 ring-cyan-500/20 scale-110 shadow-lg'
                          : step.isDistro
                          ? 'bg-slate-800 border-slate-600 text-cyan-300 group-hover:border-cyan-400'
                          : 'bg-slate-950 border-slate-700 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Step Card */}
                    <div
                      onClick={() => {
                        if (matchingDistro && !isCurrent) {
                          onSelectDistro(matchingDistro);
                        }
                      }}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-slate-800/90 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                          : matchingDistro
                          ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 cursor-pointer'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              isCurrent ? 'text-white' : 'text-slate-200'
                            }`}
                          >
                            {step.name}
                          </span>
                          {step.year && (
                            <span className="font-mono text-xs text-slate-400">
                              ({step.year})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          {isCurrent ? (
                            <span className="text-[11px] font-medium text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                              Selected Distribution
                            </span>
                          ) : step.isDistro ? (
                            <span className="text-[11px] text-slate-400 group-hover:text-cyan-400 flex items-center gap-1">
                              Ancestor <ArrowRight className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Primordial Root
                            </span>
                          )}
                        </div>
                      </div>

                      {step.desc && (
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {step.desc}
                        </p>
                      )}

                      {matchingDistro && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span>Pkg: {matchingDistro.packageManager}</span>
                          <span aria-hidden="true">·</span>
                          <span>Init: {matchingDistro.initSystem}</span>
                          <span aria-hidden="true">·</span>
                          <span>Model: {matchingDistro.releaseModel}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Direct Derivatives / Children Branch Point */}
              {children.length > 0 && (
                <div className="relative pt-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                    <GitFork className="w-3.5 h-3.5" />
                    <span>Direct Offshoots & Derivative Forks ({children.length})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => onSelectDistro(child)}
                        className="flex flex-col text-left p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-900 transition-all group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm text-slate-200 group-hover:text-emerald-400 transition-colors">
                            {child.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {child.firstReleaseYear}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                          {child.tagline}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-2">
                          <span>#{child.rank} DistroWatch</span>
                          <span aria-hidden="true">·</span>
                          <span>{child.hitsPerDay} HPD</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'forks' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1">
                Lineage Tree Branches of {distro.name}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Operating systems directly derived or based upon {distro.name}. Click any distribution to explore its detailed lineage.
              </p>
            </div>

            {children.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-400">
                <GitCommit className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-300">Terminal Node</p>
                <p className="text-xs mt-1 text-slate-400 max-w-sm mx-auto">
                  {distro.name} is a modern focused distribution with no known major downstream derivative forks in our catalog.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {children.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => onSelectDistro(child)}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900/60 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: child.brandColor }}
                        />
                        <span className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                          {child.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-cyan-400 font-semibold">
                        #{child.rank}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                      {child.tagline}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                      <span>Born: {child.firstReleaseYear}</span>
                      <span>{child.packageManager}</span>
                      <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                        Explore &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Siblings Section */}
            {siblings.length > 0 && (
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Sibling Distributions (Also derived from {ancestors[ancestors.length - 2]?.name || 'the same base'})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {siblings.map((sib) => (
                    <button
                      key={sib.id}
                      onClick={() => onSelectDistro(sib)}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900 transition-colors flex items-center gap-1.5"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: sib.brandColor }}
                      />
                      <span>{sib.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">#{sib.rank}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="text-xs text-slate-400 mb-4">
              Historical evolution of {distro.name} across decades of UNIX and Linux history:
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {ancestors.map((step) => {
                const isSelected = step.id === distro.id;
                return (
                  <div key={step.id} className="relative">
                    <div
                      className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                        isSelected
                          ? 'bg-cyan-400 border-white ring-2 ring-cyan-500/30'
                          : 'bg-slate-900 border-slate-600'
                      }`}
                    />
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-sm font-bold text-cyan-400">
                        {step.year || '1969+'}
                      </span>
                      <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {step.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tree Footer Breadcrumb */}
      <div className="pt-3 border-t border-slate-800 flex items-center gap-1.5 text-xs text-slate-400 overflow-x-auto whitespace-nowrap">
        <span className="text-slate-400 font-mono">Pedigree:</span>
        {ancestors.map((anc, idx) => (
          <React.Fragment key={anc.id}>
            {idx > 0 && <span className="text-slate-400">&gt;</span>}
            <span
              className={
                anc.id === distro.id
                  ? 'text-cyan-400 font-semibold'
                  : 'text-slate-300'
              }
            >
              {anc.name}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
