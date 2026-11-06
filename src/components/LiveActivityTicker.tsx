import React, { useState, useEffect } from 'react';
import { Distro } from '../types/distro';
import { DISTROS_DATA } from '../data/distros';
import { playPulseSound } from '../utils/audio';
import { Radio, Pause, Play, Volume2, VolumeX, Sparkles, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';

interface LiveEvent {
  id: string;
  distroId: string;
  distroName: string;
  action: string;
  location: string;
  timestamp: string;
  color: string;
}

const SAMPLE_LOCATIONS = [
  'Berlin, DE',
  'Tokyo, JP',
  'San Francisco, US',
  'Toronto, CA',
  'Amsterdam, NL',
  'London, UK',
  'São Paulo, BR',
  'Seoul, KR',
  'Sydney, AU',
  'Stockholm, SE',
  'Paris, FR',
  'Bengaluru, IN'
];

const SAMPLE_ACTIONS = [
  'opened DistroWatch profile',
  'downloaded ISO mirror',
  'viewed package tree',
  'tested live desktop',
  'queried system requirements',
  'checked rolling update notes',
  'inspected kernel changelog'
];

interface LiveActivityTickerProps {
  onSelectDistro: (distro: Distro) => void;
  onPulseDistro: (distroId: string) => void;
  isAudioOn: boolean;
  onToggleAudio: () => void;
}

export const LiveActivityTicker: React.FC<LiveActivityTickerProps> = ({
  onSelectDistro,
  onPulseDistro,
  isAudioOn,
  onToggleAudio
}) => {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate initial events
  useEffect(() => {
    const initial: LiveEvent[] = [];
    for (let i = 0; i < 4; i++) {
      const d = DISTROS_DATA[Math.floor(Math.random() * DISTROS_DATA.length)];
      initial.push({
        id: `ev-${Date.now()}-${i}`,
        distroId: d.id,
        distroName: d.name,
        action: SAMPLE_ACTIONS[Math.floor(Math.random() * SAMPLE_ACTIONS.length)],
        location: SAMPLE_LOCATIONS[Math.floor(Math.random() * SAMPLE_LOCATIONS.length)],
        timestamp: `${i * 3 + 2}s ago`,
        color: d.accentColor || d.brandColor || '#38bdf8'
      });
    }
    setEvents(initial);
  }, []);

  // Periodic event emitter
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const randomDistro = DISTROS_DATA[Math.floor(Math.random() * DISTROS_DATA.length)];
      const loc = SAMPLE_LOCATIONS[Math.floor(Math.random() * SAMPLE_LOCATIONS.length)];
      const act = SAMPLE_ACTIONS[Math.floor(Math.random() * SAMPLE_ACTIONS.length)];

      const newEvent: LiveEvent = {
        id: `ev-${Date.now()}`,
        distroId: randomDistro.id,
        distroName: randomDistro.name,
        action: act,
        location: loc,
        timestamp: 'Just now',
        color: randomDistro.accentColor || randomDistro.brandColor || '#38bdf8'
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 14)]);
      onPulseDistro(randomDistro.id);
      playPulseSound();
    }, 3800);

    return () => clearInterval(interval);
  }, [isPlaying, onPulseDistro]);

  const latestEvent = events[0];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-md transition-all">
      {/* Expanded Live Event Drawer */}
      {isExpanded && (
        <div className="p-3 sm:p-4 max-h-56 overflow-y-auto border-b border-slate-800 space-y-1.5 bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2 px-1">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>Global DistroWatch Activity Stream</span>
            </span>
            <span>Real-time community telemetry</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {events.map((ev) => {
              const matched = DISTROS_DATA.find((d) => d.id === ev.distroId);
              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    if (matched) onSelectDistro(matched);
                  }}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/50 transition-colors cursor-pointer flex items-center justify-between gap-2 text-xs group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: ev.color }}
                    />
                    <div className="truncate">
                      <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {ev.distroName}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {ev.action} · {ev.location}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {ev.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Single-Line Ticker Bar */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 text-xs">
        {/* Left: Live stream status indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-cyan-400">
            <span className="relative flex h-2 w-2">
              {isPlaying && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="hidden sm:inline">LIVE TELEMETRY:</span>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title={isPlaying ? 'Pause live stream' : 'Resume live stream'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          <button
            onClick={onToggleAudio}
            className={`p-1 transition-colors ${isAudioOn ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            title={isAudioOn ? 'Mute procedural sound effects' : 'Enable procedural audio synthesis'}
          >
            {isAudioOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Center: Latest animated event text */}
        {latestEvent && (
          <div
            onClick={() => {
              const d = DISTROS_DATA.find((item) => item.id === latestEvent.distroId);
              if (d) onSelectDistro(d);
            }}
            className="flex-1 flex items-center justify-center gap-2 truncate cursor-pointer group"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: latestEvent.color }}
            />
            <span className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
              {latestEvent.distroName}
            </span>
            <span className="text-slate-400 hidden md:inline">
              {latestEvent.action} from <span className="text-slate-300">{latestEvent.location}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              ({latestEvent.timestamp})
            </span>
          </div>
        )}

        {/* Right: Expand / Collapse Drawer Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors flex items-center gap-1 font-mono"
          >
            <span>{isExpanded ? 'Hide Feed' : 'Live Feed'}</span>
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};
