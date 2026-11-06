import React from 'react';
import { Distro } from '../types/distro';
import { X, Scale, Trash2, ArrowRight } from 'lucide-react';

interface CompareModalProps {
  distros: Distro[];
  onRemoveDistro: (distroId: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  onSelectDistro: (distro: Distro) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  distros,
  onRemoveDistro,
  onClearAll,
  onClose,
  onSelectDistro
}) => {
  if (distros.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Distribution Comparison Matrix ({distros.length} Selected)
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Comparison</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-auto p-5 bg-slate-950/60">
          <div className="min-w-[650px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="py-3 px-3 w-40 text-slate-400 font-mono font-medium">Metric</th>
                  {distros.map((d) => (
                    <th key={d.id} className="py-3 px-3">
                      <div className="flex items-center justify-between gap-2">
                        <div
                          onClick={() => {
                            onClose();
                            onSelectDistro(d);
                          }}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: d.brandColor }}
                          />
                          <span className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors text-sm">
                            {d.name}
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveDistro(d.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove from compare"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-3 px-3 text-slate-400 font-mono">DistroWatch Rank</td>
                  {distros.map((d) => (
                    <td key={d.id} className="py-3 px-3 font-mono font-bold text-cyan-400 text-sm">
                      #{d.rank}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 text-slate-400 font-mono">Hits / Day (HPD)</td>
                  {distros.map((d) => (
                    <td key={d.id} className="py-3 px-3 font-mono text-slate-200">
                      {d.hitsPerDay.toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 text-slate-400 font-mono">Lineage Base</td>
                  {distros.map((d) => (
                    <td key={d.id} className="py-3 px-3 text-purple-300 font-medium">
                      {d.family} ({d.basedOn.join(', ')})
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 text-slate-400 font-mono">Release Model</td>
                  {distros.map((d) => (
                    <td key={d.id} className="py-3 px-3 text-slate-200 font-mono">
                      {d.releaseModel}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 text-slate-400 font-mono">Package Manager</td>
                  {distros.map((d) => (
                    <td key={d.id} className="py-3 px-3 font-mono text-emerald-400">
                      {d.packageManager}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 text-slate-400 font-mono">Init System</td>
                  {distros.map((d) => (
                    <td key={d.id} className="py-3 px-3 font-mono text-slate-300">
                      {d.initSystem}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 text-slate-400 font-mono">Default / Available Desktops</td>
                  {distros.map((d) => (
                    <td key={d.id} className="py-3 px-3 text-slate-300">
                      {d.desktopEnvironments.join(', ')}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 text-slate-400 font-mono">Min Recommended RAM</td>
                  {distros.map((d) => (
                    <td key={d.id} className="py-3 px-3 font-mono text-slate-200">
                      {d.minRamGb} GB
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 text-slate-400 font-mono">Default Filesystem</td>
                  {distros.map((d) => (
                    <td key={d.id} className="py-3 px-3 font-mono text-slate-300">
                      {d.defaultFs}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 text-slate-400 font-mono">Inception Year</td>
                  {distros.map((d) => (
                    <td key={d.id} className="py-3 px-3 font-mono text-slate-300">
                      {d.firstReleaseYear}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 text-slate-400 font-mono">Origin Country</td>
                  {distros.map((d) => (
                    <td key={d.id} className="py-3 px-3 text-slate-300">
                      {d.originCountry}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 text-slate-400 font-mono">Target Audience</td>
                  {distros.map((d) => (
                    <td key={d.id} className="py-3 px-3 text-slate-300">
                      {d.category.join(' · ')}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Click on any distribution name above to open its deep Lineage Tree & specifications.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
