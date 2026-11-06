import React, { useState, useEffect, useCallback } from 'react';
import { Distro } from '../types/distro';
import {
  FileText,
  Save,
  Trash2,
  Copy,
  Check,
  Star,
  Clock,
  Sparkles,
  Tag,
  CheckCircle2,
  Laptop
} from 'lucide-react';

interface DistroUserNotesProps {
  distro: Distro;
}

interface SavedNoteData {
  text: string;
  rating: number; // 0 to 5
  tags: string[];
  updatedAt: string;
}

const STORAGE_KEY_PREFIX = 'distrosphere_user_notes_';

const QUICK_TAG_SUGGESTIONS = [
  'Daily Driver',
  'Tested on Hardware',
  'Great Battery Life',
  'Server Candidate',
  'Gaming Ready',
  'Needs Tweak',
  'Minimalist'
];

export const DistroUserNotes: React.FC<DistroUserNotesProps> = ({ distro }) => {
  const storageKey = `${STORAGE_KEY_PREFIX}${distro.id}`;

  const [noteText, setNoteText] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty' | 'idle'>('idle');
  const [copied, setCopied] = useState(false);

  // Load from localStorage on distro change
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(storageKey);
      if (savedRaw) {
        const parsed: SavedNoteData = JSON.parse(savedRaw);
        setNoteText(parsed.text || '');
        setRating(parsed.rating || 0);
        setSelectedTags(parsed.tags || []);
        setLastSavedTime(parsed.updatedAt || null);
        setSaveStatus('saved');
      } else {
        setNoteText('');
        setRating(0);
        setSelectedTags([]);
        setLastSavedTime(null);
        setSaveStatus('idle');
      }
    } catch (err) {
      console.error('Failed to load user note:', err);
    }
  }, [distro.id, storageKey]);

  // Save to localStorage
  const handleSave = useCallback(() => {
    try {
      setSaveStatus('saving');
      const now = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const dataToSave: SavedNoteData = {
        text: noteText,
        rating,
        tags: selectedTags,
        updatedAt: now
      };

      if (!noteText.trim() && rating === 0 && selectedTags.length === 0) {
        localStorage.removeItem(storageKey);
        setLastSavedTime(null);
        setSaveStatus('idle');
      } else {
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        setLastSavedTime(now);
        setSaveStatus('saved');
      }
    } catch (err) {
      console.error('Failed to save user note:', err);
    }
  }, [noteText, rating, selectedTags, storageKey]);

  // Auto-save debounced after changes
  useEffect(() => {
    if (saveStatus === 'idle' && !noteText && rating === 0 && selectedTags.length === 0) {
      return;
    }

    setSaveStatus('dirty');
    const timer = setTimeout(() => {
      handleSave();
    }, 800);

    return () => clearTimeout(timer);
  }, [noteText, rating, selectedTags, handleSave]);

  const handleClear = () => {
    if (window.confirm(`Clear all saved notes and ratings for ${distro.name}?`)) {
      localStorage.removeItem(storageKey);
      setNoteText('');
      setRating(0);
      setSelectedTags([]);
      setLastSavedTime(null);
      setSaveStatus('idle');
    }
  };

  const handleCopy = () => {
    if (!noteText.trim()) return;
    const exportText = `Notes on ${distro.name} (DistroWatch #${distro.rank}):\n${noteText}\nRating: ${rating}/5 Stars\nTags: ${selectedTags.join(', ')}`;
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const insertTemplate = (templateName: string) => {
    let snippet = '';
    if (templateName === 'hardware') {
      snippet = `\n### Hardware Test Log\n- Device: \n- Kernel: \n- Battery Life: \n- WiFi / Bluetooth: [Works / Issue]\n- GPU Switching: `;
    } else if (templateName === 'pros_cons') {
      snippet = `\n### Pros & Cons\n+ Pros: \n- Cons: \n- Dealbreakers: `;
    } else if (templateName === 'packages') {
      snippet = `\n### Essential Packages\n- Must install: \n- Preferred DE config: `;
    }

    setNoteText((prev) => (prev ? prev + '\n' + snippet : snippet.trim()));
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Top Banner / Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Personal Notes & Rating for {distro.name}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Saved securely in your browser's persistent localStorage.
          </p>
        </div>

        {/* Sync / Save Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {saveStatus === 'saving' && (
            <span className="text-amber-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Saving...</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved locally</span>
            </span>
          )}
          {saveStatus === 'dirty' && (
            <span className="text-slate-400 flex items-center gap-1">
              <span>Unsaved changes...</span>
            </span>
          )}
          {lastSavedTime && (
            <span className="text-slate-500 text-[11px] hidden sm:inline">
              · {lastSavedTime}
            </span>
          )}
        </div>
      </div>

      {/* Rating & Quick Tags Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        {/* 5-Star Rating Control */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-medium">My Personal Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(rating === star ? 0 : star)}
                  className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="text-xs font-mono text-amber-300 font-bold ml-1">
                {rating}/5
              </span>
            )}
          </div>

          {/* Quick template injection buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-mono hidden md:inline">
              Templates:
            </span>
            <button
              onClick={() => insertTemplate('hardware')}
              className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              + Hardware Log
            </button>
            <button
              onClick={() => insertTemplate('pros_cons')}
              className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              + Pros/Cons
            </button>
          </div>
        </div>

        {/* Tag Pills (Interactive Selection) */}
        <div>
          <span className="text-[11px] text-slate-400 font-mono block mb-1.5">
            Personal Workflow Tags:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAG_SUGGESTIONS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                    active
                      ? 'bg-cyan-950 border border-cyan-700 text-cyan-300'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Editor Textarea Card */}
      <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner focus-within:border-cyan-500/70 transition-colors">
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={`Write your personal impressions, installation instructions, favorite kernel flags, or review notes for ${distro.name}...`}
          rows={8}
          className="w-full p-4 bg-transparent text-sm text-slate-100 placeholder-slate-600 focus:outline-none resize-y leading-relaxed font-sans"
        />

        {/* Editor Bottom Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>{noteText.length} characters</span>
            <span>·</span>
            <span>{noteText.trim() ? noteText.trim().split(/\s+/).length : 0} words</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!noteText.trim()}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none rounded transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Notes</span>
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3 h-3" />
              <span>Save Now</span>
            </button>

            {(noteText || rating > 0 || selectedTags.length > 0) && (
              <button
                onClick={handleClear}
                className="px-2 py-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
