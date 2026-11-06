import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock } from 'lucide-react';
import { playPopSound } from '../utils/audio';

interface EvolutionPlayerProps {
  maxYear: number;
  setMaxYear: React.Dispatch<React.SetStateAction<number>>;
  isActive: boolean;
  onToggleActive: () => void;
}

const HISTORICAL_MILESTONES: Record<number, string> = {
  1991: 'Linus Torvalds releases monolithic Linux Kernel 0.01 at University of Helsinki.',
  1993: 'Patrick Volkerding releases Slackware & Ian Murdock founds Debian GNU/Linux.',
  1994: 'Red Hat Linux introduces RPM packages; S.u.S.E. Linux founded in Nuremberg.',
  1998: 'Mandrake Linux releases, making KDE desktop computing accessible to the masses.',
  2000: 'Red Hat Enterprise Linux (RHEL) launched for mission-critical enterprise servers.',
  2002: 'Judd Vinet creates Arch Linux (KISS); Gentoo introduces Portage compilation.',
  2003: 'Fedora Project launched as upstream for RHEL; NixOS introduces functional builds.',
  2004: 'Mark Shuttleworth founds Ubuntu: "Linux for Human Beings".',
  2005: 'openSUSE project launched; Alpine Linux pioneers ultra-minimalist Busybox OS.',
  2006: 'Linux Mint launches, perfecting the intuitive Windows-friendly desktop.',
  2007: 'antiX releases systemd-free lightweight computing for legacy computers.',
  2008: 'Juan RP engineers Void Linux from scratch with XBPS and runit.',
  2009: 'Zorin OS launches desktop morphing; Tails amnesic privacy OS emerges.',
  2010: 'Lubuntu launches LXDE/LXQt flavor; Mageia forks from Mandriva.',
  2011: 'Manjaro makes Arch friendly; elementary OS debuts Pantheon desktop.',
  2012: 'Raspberry Pi OS debuts for ARM education; Qubes OS introduces Xen isolation.',
  2013: 'Kali Linux created for offensive security; Valve releases SteamOS 1.0.',
  2014: 'MX Linux combines MEPIS and antiX into the world\'s top-ranked desktop.',
  2017: 'System76 launches Pop!_OS; postmarketOS targets 10-year smartphone lifespan.',
  2018: 'Fedora Silverblue introduces immutable atomic OSTree desktop containers.',
  2019: 'EndeavourOS rises from Antergos as the premier friendly terminal Arch portal.',
  2021: 'Rocky Linux & AlmaLinux replace CentOS; Valve releases Arch-powered SteamOS 3.0.',
  2022: 'Nobara Linux gaming spin created; Vanilla OS introduces multi-distro Apx containers.',
  2023: 'Bazzite launches atomic PC gaming OS powering modern handheld consoles.',
  2026: 'The modern Linux universe: 45+ thriving distributions spanning servers to handhelds.'
};

export const EvolutionPlayer: React.FC<EvolutionPlayerProps> = ({
  maxYear,
  setMaxYear,
  isActive,
  onToggleActive
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Stop playing when max year is reached
  useEffect(() => {
    if (maxYear >= 2026 && isPlaying) {
      setIsPlaying(false);
    }
  }, [maxYear, isPlaying]);

  // Reset playing if component is closed
  useEffect(() => {
    if (!isActive) {
      setIsPlaying(false);
    }
  }, [isActive]);

  // Audio effect on year progression during active playback
  useEffect(() => {
    if (isPlaying && isActive) {
      playPopSound(300 + (maxYear - 1991) * 12, 0.02);
    }
  }, [maxYear, isPlaying, isActive]);

  // Interval timer for advancing years
  useEffect(() => {
    if (!isPlaying || !isActive || maxYear >= 2026) return;

    const interval = setInterval(() => {
      setMaxYear((prev) => Math.min(2026, prev + 1));
    }, 700);

    return () => clearInterval(interval);
  }, [isPlaying, isActive, maxYear, setMaxYear]);

  if (!isActive) return null;

  const currentMilestone =
    HISTORICAL_MILESTONES[maxYear] ||
    Object.entries(HISTORICAL_MILESTONES)
      .reverse()
      .find(([y]) => Number(y) <= maxYear)?.[1] ||
    'Exploring evolutionary expansion of the Linux ecosystem.';

  return (
    <div className="absolute top-14 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-30 p-4 bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl shadow-2xl animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Chronological Timeline
          </h4>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-base font-bold text-cyan-400">
          <span>{maxYear}</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed min-h-[38px] mb-3">
        {currentMilestone}
      </p>

      {/* Year Scrubbing Slider */}
      <input
        type="range"
        min={1991}
        max={2026}
        value={maxYear}
        onChange={(e) => {
          setMaxYear(Number(e.target.value));
          playPopSound(350 + (Number(e.target.value) - 1991) * 10, 0.02);
        }}
        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg mb-3"
      />

      {/* Playback Controls */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (!isPlaying && maxYear >= 2026) {
                setMaxYear(1991);
              }
              setIsPlaying(!isPlaying);
            }}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Timeline'}</span>
          </button>

          <button
            onClick={() => {
              setMaxYear(1991);
              setIsPlaying(true);
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            title="Restart from 1991"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onToggleActive}
          className="text-[11px] text-slate-400 hover:text-white transition-colors"
        >
          Exit Player
        </button>
      </div>
    </div>
  );
};
