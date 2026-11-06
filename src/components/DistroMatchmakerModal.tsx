import React, { useState } from 'react';
import { Distro } from '../types/distro';
import { DISTROS_DATA } from '../data/distros';
import { playChimeSound, playPopSound } from '../utils/audio';
import { Sparkles, X, Check, ArrowRight, RotateCcw, Cpu, Laptop, Shield, Gamepad, Server, Terminal } from 'lucide-react';

interface DistroMatchmakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDistro: (distro: Distro) => void;
}

export const DistroMatchmakerModal: React.FC<DistroMatchmakerModalProps> = ({
  isOpen,
  onClose,
  onSelectDistro
}) => {
  const [step, setStep] = useState<number>(1);
  const [hardware, setHardware] = useState<string>('modern');
  const [purpose, setPurpose] = useState<string>('desktop');
  const [philosophy, setPhilosophy] = useState<string>('stable');
  const [matchedResults, setMatchedResults] = useState<{ distro: Distro; score: number; reason: string }[]>([]);

  if (!isOpen) return null;

  const handleNext = () => {
    playPopSound(500, 0.03);
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Calculate scores
      calculateMatches();
      setStep(4);
    }
  };

  const calculateMatches = () => {
    const scored = DISTROS_DATA.map((d) => {
      let score = 50;
      let reasons: string[] = [];

      // Hardware matching
      if (hardware === 'low_spec') {
        if (d.category.includes('Lightweight') || d.minRamGb <= 1) {
          score += 30;
          reasons.push('Ultra lightweight footprint for modest hardware');
        } else if (d.minRamGb > 4) {
          score -= 25;
        }
      } else if (hardware === 'arm') {
        if (d.architectures.includes('aarch64') || d.id === 'raspbian' || d.id === 'postmarketos') {
          score += 35;
          reasons.push('First-class ARM/Raspberry Pi architecture optimization');
        }
      } else if (hardware === 'modern') {
        if (d.category.includes('Gaming') || d.architectures.includes('x86_64')) {
          score += 15;
        }
      }

      // Purpose matching
      if (purpose === 'gaming') {
        if (d.category.includes('Gaming') || d.id === 'steamos' || d.id === 'nobara' || d.id === 'bazzite' || d.id === 'garuda') {
          score += 40;
          reasons.push('Tailored out-of-the-box gaming kernels and drivers');
        }
      } else if (purpose === 'security') {
        if (d.category.includes('Security & Forensics') || d.id === 'tails' || d.id === 'qubes' || d.id === 'kali' || d.id === 'parrot') {
          score += 45;
          reasons.push('Built-in penetration testing & privacy compartmentalization');
        }
      } else if (purpose === 'server') {
        if (d.category.includes('Server') || d.id === 'debian' || d.id === 'rocky' || d.id === 'almalinux' || d.id === 'alpine') {
          score += 35;
          reasons.push('Enterprise-tested uptime and headless stability');
        }
      } else if (purpose === 'desktop') {
        if (d.category.includes('Beginner') || d.category.includes('Desktop') || d.id === 'linuxmint' || d.id === 'ubuntu' || d.id === 'zorin' || d.id === 'popos') {
          score += 30;
          reasons.push('Intuitive out-of-the-box GUI workflow');
        }
      }

      // Philosophy matching
      if (philosophy === 'rolling') {
        if (d.releaseModel === 'Rolling') {
          score += 25;
          reasons.push('Bleeding-edge rolling release cadence');
        }
      } else if (philosophy === 'stable') {
        if (d.releaseModel === 'Fixed Point' || d.releaseModel === 'Semi-Rolling') {
          score += 25;
          reasons.push('Predictable long-term stability & point releases');
        }
      } else if (philosophy === 'immutable') {
        if (d.releaseModel === 'Immutable' || d.category.includes('Immutable / Atomic') || d.id === 'nixos' || d.id === 'silverblue' || d.id === 'vanilla' || d.id === 'bazzite') {
          score += 40;
          reasons.push('Atomic containerized transactions and rollback safety');
        }
      }

      // Popularity boost
      if (d.rank <= 10) score += 10;

      return {
        distro: d,
        score: Math.min(99, Math.max(30, score)),
        reason: reasons[0] || 'Balanced ecosystem for your workflow'
      };
    });

    scored.sort((a, b) => b.score - a.score);
    setMatchedResults(scored.slice(0, 3));
    playChimeSound(750, 0.35);
  };

  const handleReset = () => {
    setStep(1);
    setHardware('modern');
    setPurpose('desktop');
    setPhilosophy('stable');
    setMatchedResults([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-white text-base sm:text-lg tracking-tight">
              Linux Matchmaker Wizard
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps */}
        <div className="py-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-semibold">Step 1 of 3</span>
                <h3 className="text-base font-bold text-white mt-1">
                  What hardware will you be running on?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Helps identify distributions tuned for your machine's resource limits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'modern', label: 'Modern PC / Laptop', desc: '4GB+ RAM, multi-core CPU' },
                  { id: 'low_spec', label: 'Older Machine / Low RAM', desc: 'Revive older PC (<2GB RAM)' },
                  { id: 'arm', label: 'ARM / Raspberry Pi', desc: 'Single-board ARM hardware' },
                  { id: 'vm', label: 'Virtual Machine / Cloud', desc: 'Docker, Proxmox, or QEMU' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setHardware(item.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      hardware === item.id
                        ? 'bg-cyan-950/70 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-semibold">Step 2 of 3</span>
                <h3 className="text-base font-bold text-white mt-1">
                  What is your primary mission?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your core daily workflow focus.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'desktop', label: 'Everyday & Office', desc: 'Browsing, docs, streaming' },
                  { id: 'gaming', label: 'PC Gaming & Handheld', desc: 'Steam, Proton, GPU performance' },
                  { id: 'security', label: 'Security & Privacy', desc: 'Anonymity, forensics, pen-testing' },
                  { id: 'server', label: 'Server & Homelab', desc: 'Self-hosting, Docker, high uptime' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPurpose(item.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      purpose === item.id
                        ? 'bg-cyan-950/70 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-semibold">Step 3 of 3</span>
                <h3 className="text-base font-bold text-white mt-1">
                  What is your release philosophy?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Do you want bulletproof stability or cutting-edge packages?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'stable', label: 'Rock-Solid LTS', desc: 'Tested, predictable point releases' },
                  { id: 'rolling', label: 'Bleeding-Edge Rolling', desc: 'Latest kernel & package builds' },
                  { id: 'immutable', label: 'Immutable / Atomic', desc: 'Container-first, zero-risk rollbacks' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPhilosophy(item.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      philosophy === item.id
                        ? 'bg-cyan-950/70 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Match Analysis Complete</span>
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Your Top 3 Recommended Distributions
                </h3>
              </div>

              <div className="space-y-3">
                {matchedResults.map((item, idx) => (
                  <div
                    key={item.distro.id}
                    onClick={() => {
                      onClose();
                      onSelectDistro(item.distro);
                    }}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer group flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md"
                        style={{ backgroundColor: item.distro.brandColor }}
                      >
                        {item.distro.logoGlyph}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">
                            {item.distro.name}
                          </span>
                          <span className="font-mono text-[10px] text-cyan-400">
                            #{item.distro.rank} DistroWatch
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                          {item.reason}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1">
                          <span>{item.distro.packageManager}</span>
                          <span>·</span>
                          <span>{item.distro.releaseModel}</span>
                          <span>·</span>
                          <span>{item.distro.desktopEnvironments[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-mono font-bold text-emerald-400 block">
                        {item.score}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Match Score
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              &larr; Back
            </button>
          ) : step === 4 ? (
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>{step === 3 ? 'Reveal My Match' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
