import React, { useState, useMemo } from 'react';
import { DISTROS_DATA } from './data/distros';
import { Distro, DistroFamily, ClusterMode } from './types/distro';
import { TopBar } from './components/TopBar';
import { Toolbar } from './components/Toolbar';
import { BubbleCanvas } from './components/BubbleCanvas';
import { DistroDetailPanel } from './components/DistroDetailPanel';
import { DistroWatchRankingTable } from './components/DistroWatchRankingTable';
import { LineageGraphView } from './components/LineageGraphView';
import { CompareModal } from './components/CompareModal';
import { LiveActivityTicker } from './components/LiveActivityTicker';
import { DistroMatchmakerModal } from './components/DistroMatchmakerModal';
import { EvolutionPlayer } from './components/EvolutionPlayer';
import { toggleAudio, getAudioEnabled, playChimeSound } from './utils/audio';

export default function App() {
  const [activeView, setActiveView] = useState<'bubbles' | 'rankings' | 'lineage'>('bubbles');
  const [selectedDistro, setSelectedDistro] = useState<Distro | null>(null);
  const [hoveredDistroId, setHoveredDistroId] = useState<string | null>(null);
  const [pulseDistroId, setPulseDistroId] = useState<string | null>(null);

  // Audio synthesis state
  const [isAudioOn, setIsAudioOn] = useState<boolean>(getAudioEnabled());

  // Interactive dynamic features
  const [isMatchmakerOpen, setIsMatchmakerOpen] = useState(false);
  const [isEvolutionActive, setIsEvolutionActive] = useState(false);
  const [evolutionMaxYear, setEvolutionMaxYear] = useState(2026);

  // Filters & Physics state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<DistroFamily | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [clusterMode, setClusterMode] = useState<ClusterMode>('family');

  // Comparison State
  const [comparedDistros, setComparedDistros] = useState<Distro[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const handleToggleAudio = () => {
    const updated = toggleAudio();
    setIsAudioOn(updated);
  };

  // Filtered distros calculation
  const filteredDistros = useMemo(() => {
    return DISTROS_DATA.filter((distro) => {
      // Evolution timeline filter
      if (isEvolutionActive && distro.firstReleaseYear > evolutionMaxYear) {
        return false;
      }

      // Family filter
      if (selectedFamily !== 'All' && distro.family !== selectedFamily) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All Categories' && !distro.category.includes(selectedCategory as any)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = distro.name.toLowerCase().includes(q);
        const matchesTagline = distro.tagline.toLowerCase().includes(q);
        const matchesPkg = distro.packageManager.toLowerCase().includes(q);
        const matchesDesktops = distro.desktopEnvironments.some((de) => de.toLowerCase().includes(q));
        const matchesBasedOn = distro.basedOn.some((b) => b.toLowerCase().includes(q));
        const matchesCountry = distro.originCountry.toLowerCase().includes(q);
        if (!matchesName && !matchesTagline && !matchesPkg && !matchesDesktops && !matchesBasedOn && !matchesCountry) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedFamily, selectedCategory, isEvolutionActive, evolutionMaxYear]);

  // Random distro picker
  const handleRandomDistro = () => {
    const randomIndex = Math.floor(Math.random() * DISTROS_DATA.length);
    const chosen = DISTROS_DATA[randomIndex];
    setSelectedDistro(chosen);
    setPulseDistroId(chosen.id);
    playChimeSound(640);
  };

  // Compare handlers
  const handleToggleCompare = (distro: Distro) => {
    if (comparedDistros.some((d) => d.id === distro.id)) {
      setComparedDistros((prev) => prev.filter((d) => d.id !== distro.id));
    } else {
      if (comparedDistros.length >= 4) {
        alert('You can compare up to 4 distributions simultaneously.');
        return;
      }
      setComparedDistros((prev) => [...prev, distro]);
    }
  };

  const handleRemoveCompare = (distroId: string) => {
    setComparedDistros((prev) => prev.filter((d) => d.id !== distroId));
  };

  const handleSelectAndPulse = (distro: Distro) => {
    setSelectedDistro(distro);
    setPulseDistroId(distro.id);
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* 1. Universal Top Navigation Bar (Strict 3-zone Top Bar Contract) */}
      <TopBar
        activeView={activeView}
        setActiveView={setActiveView}
        onRandomDistro={handleRandomDistro}
        compareCount={comparedDistros.length}
        onOpenCompare={() => setIsCompareOpen(true)}
      />

      {/* 2. Secondary Filter & Physics Controls Toolbar */}
      <Toolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFamily={selectedFamily}
        setSelectedFamily={setSelectedFamily}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        clusterMode={clusterMode}
        setClusterMode={setClusterMode}
        activeView={activeView}
        setActiveView={setActiveView}
        totalFilteredCount={filteredDistros.length}
        onOpenMatchmaker={() => setIsMatchmakerOpen(true)}
        isEvolutionActive={isEvolutionActive}
        onToggleEvolution={() => {
          if (!isEvolutionActive) {
            setEvolutionMaxYear(2026);
          }
          setIsEvolutionActive(!isEvolutionActive);
        }}
      />

      {/* 3. Main Stage Area */}
      <main className="flex-1 relative overflow-hidden bg-slate-950">
        {activeView === 'bubbles' && (
          <BubbleCanvas
            distros={filteredDistros}
            selectedDistro={selectedDistro}
            onSelectDistro={handleSelectAndPulse}
            clusterMode={clusterMode}
            hoveredDistroId={hoveredDistroId}
            setHoveredDistroId={setHoveredDistroId}
            pulseDistroId={pulseDistroId}
          />
        )}

        {activeView === 'rankings' && (
          <DistroWatchRankingTable
            distros={filteredDistros}
            onSelectDistro={handleSelectAndPulse}
            onAddToCompare={handleToggleCompare}
            comparedIds={comparedDistros.map((d) => d.id)}
          />
        )}

        {activeView === 'lineage' && (
          <LineageGraphView
            onSelectDistro={handleSelectAndPulse}
            selectedDistro={selectedDistro}
          />
        )}

        {/* Evolution Timeline Overlay Player */}
        <EvolutionPlayer
          maxYear={evolutionMaxYear}
          setMaxYear={setEvolutionMaxYear}
          isActive={isEvolutionActive}
          onToggleActive={() => setIsEvolutionActive(!isEvolutionActive)}
        />

        {/* Live DistroWatch Activity Stream Bottom Bar */}
        <LiveActivityTicker
          onSelectDistro={handleSelectAndPulse}
          onPulseDistro={(id) => setPulseDistroId(id)}
          isAudioOn={isAudioOn}
          onToggleAudio={handleToggleAudio}
        />
      </main>

      {/* 4. Deep Distro & Lineage Tree Inspector Modal */}
      {selectedDistro && (
        <DistroDetailPanel
          distro={selectedDistro}
          onClose={() => setSelectedDistro(null)}
          onSelectDistro={handleSelectAndPulse}
          onAddToCompare={handleToggleCompare}
          isCompared={comparedDistros.some((d) => d.id === selectedDistro.id)}
        />
      )}

      {/* 5. Side-by-Side Comparison Matrix Modal */}
      {isCompareOpen && (
        <CompareModal
          distros={comparedDistros}
          onRemoveDistro={handleRemoveCompare}
          onClearAll={() => setComparedDistros([])}
          onClose={() => setIsCompareOpen(false)}
          onSelectDistro={(d) => {
            setIsCompareOpen(false);
            handleSelectAndPulse(d);
          }}
        />
      )}

      {/* 6. Distro Matchmaker Recommendation Wizard Modal */}
      <DistroMatchmakerModal
        isOpen={isMatchmakerOpen}
        onClose={() => setIsMatchmakerOpen(false)}
        onSelectDistro={(d) => {
          setIsMatchmakerOpen(false);
          handleSelectAndPulse(d);
        }}
      />
    </div>
  );
}
