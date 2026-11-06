import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Distro } from '../types/distro';
import { playPopSound, playChimeSound } from '../utils/audio';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Compass, Sparkles, Orbit } from 'lucide-react';

interface CelestialBody {
  id: string;
  name: string;
  distro?: Distro;
  isSun?: boolean;
  isPlanet?: boolean;
  isMoon?: boolean;
  parentKey: string | null; // e.g. 'linux' or 'debian' or 'ubuntu'
  orbitRadius: number; // distance from parent in px
  currentAngle: number;
  orbitSpeed: number; // radians per second
  radius: number; // visual body radius
  color: string;
  glowColor: string;
  glyph: string;
  rank?: number;
  // Computed canvas position per frame
  x: number;
  y: number;
}

interface SolarSystemCanvasProps {
  distros: Distro[];
  selectedDistro: Distro | null;
  onSelectDistro: (distro: Distro) => void;
  hoveredDistroId: string | null;
  setHoveredDistroId: (id: string | null) => void;
}

export const SolarSystemCanvas: React.FC<SolarSystemCanvasProps> = ({
  distros,
  selectedDistro,
  onSelectDistro,
  hoveredDistroId,
  setHoveredDistroId
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport transforms (Pan & Zoom)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.85 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Animation controls
  const [isOrbiting, setIsOrbiting] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [showOrbitRings, setShowOrbitRings] = useState(true);

  // Mouse coordinate
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Starfield dust particles
  const starfieldRef = useRef<{ x: number; y: number; size: number; alpha: number }[]>([]);

  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 3200,
        y: (Math.random() - 0.5) * 2400,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.15
      });
    }
    starfieldRef.current = stars;
  }, []);

  // Build the hierarchical solar system model
  // Central Sun = Linux Kernel
  // Major Primary Planets = Debian, Red Hat/Fedora, Slackware/openSUSE, Arch, Independent Cluster
  // Moons = Child distributions orbiting their direct parent!
  const celestialBodies = useMemo<CelestialBody[]>(() => {
    const distroMap = new Map(distros.map((d) => [d.id, d]));
    const bodies: CelestialBody[] = [];

    // 1. The Central Star: Linux Kernel (1991)
    bodies.push({
      id: 'sun_linux',
      name: 'Linux Kernel (1991)',
      isSun: true,
      parentKey: null,
      orbitRadius: 0,
      currentAngle: 0,
      orbitSpeed: 0,
      radius: 42,
      color: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.45)',
      glyph: 'KERNEL',
      x: 0,
      y: 0
    });

    // Primary Parent Rings around the Sun:
    // Orbit 1: Debian (radius 180)
    // Orbit 2: Arch Linux (radius 320)
    // Orbit 3: Red Hat & Fedora (radius 460)
    // Orbit 4: Slackware & openSUSE (radius 600)
    // Orbit 5: Independent Kuiper Belt (NixOS, Alpine, Gentoo, Void, Solus) (radius 740)

    // Primary Planet: Debian
    const debianDistro = distroMap.get('debian');
    bodies.push({
      id: 'debian',
      name: debianDistro?.name || 'Debian',
      distro: debianDistro,
      isPlanet: true,
      parentKey: 'sun_linux',
      orbitRadius: 210,
      currentAngle: 0.2,
      orbitSpeed: 0.14,
      radius: 32,
      color: debianDistro?.brandColor || '#d70a53',
      glowColor: 'rgba(215, 10, 83, 0.5)',
      glyph: 'DEB',
      rank: debianDistro?.rank,
      x: 0,
      y: 0
    });

    // Major Planet orbiting Debian: Ubuntu!
    const ubuntuDistro = distroMap.get('ubuntu');
    bodies.push({
      id: 'ubuntu',
      name: ubuntuDistro?.name || 'Ubuntu',
      distro: ubuntuDistro,
      isPlanet: true,
      parentKey: 'debian',
      orbitRadius: 95,
      currentAngle: 0.8,
      orbitSpeed: 0.35,
      radius: 28,
      color: ubuntuDistro?.brandColor || '#e95420',
      glowColor: 'rgba(233, 84, 32, 0.5)',
      glyph: 'UBU',
      rank: ubuntuDistro?.rank,
      x: 0,
      y: 0
    });

    // Moons of Ubuntu: Mint, Pop!_OS, Zorin, elementary, KDE neon, Lubuntu
    const ubuntuMoons = ['linuxmint', 'popos', 'zorin', 'elementary', 'kde-neon', 'lubuntu', 'bodhi'];
    ubuntuMoons.forEach((mId, idx) => {
      const d = distroMap.get(mId);
      if (d) {
        const moonRadius = 45 + (idx % 3) * 22;
        const speed = 0.55 + idx * 0.08;
        bodies.push({
          id: d.id,
          name: d.name,
          distro: d,
          isMoon: true,
          parentKey: 'ubuntu',
          orbitRadius: moonRadius,
          currentAngle: (idx / ubuntuMoons.length) * Math.PI * 2,
          orbitSpeed: speed,
          radius: 18 + Math.min(10, Math.max(0, (d.hitsPerDay - 200) / 300)),
          color: d.brandColor || '#87cf3e',
          glowColor: `${d.brandColor}66`,
          glyph: d.logoGlyph,
          rank: d.rank,
          x: 0,
          y: 0
        });
      }
    });

    // Other direct Moons of Debian: MX Linux (#1), Kali, Tails, antiX, Parrot, Raspbian, Devuan
    const debianMoons = ['mxlinux', 'kali', 'tails', 'antix', 'parrot', 'raspbian', 'devuan', 'deepin', 'vanilla', 'peppermint'];
    debianMoons.forEach((mId, idx) => {
      const d = distroMap.get(mId);
      if (d) {
        const moonRadius = 60 + (idx % 4) * 26;
        const speed = 0.4 + idx * 0.06;
        bodies.push({
          id: d.id,
          name: d.name,
          distro: d,
          isMoon: true,
          parentKey: 'debian',
          orbitRadius: moonRadius,
          currentAngle: 1.2 + (idx / debianMoons.length) * Math.PI * 2,
          orbitSpeed: -speed, // retrograde counter orbit for balance
          radius: 18 + Math.min(12, Math.max(0, (d.hitsPerDay - 200) / 280)),
          color: d.brandColor || '#2b5876',
          glowColor: `${d.brandColor}66`,
          glyph: d.logoGlyph,
          rank: d.rank,
          x: 0,
          y: 0
        });
      }
    });

    // Primary Planet: Arch Linux
    const archDistro = distroMap.get('arch');
    bodies.push({
      id: 'arch',
      name: archDistro?.name || 'Arch Linux',
      distro: archDistro,
      isPlanet: true,
      parentKey: 'sun_linux',
      orbitRadius: 360,
      currentAngle: 2.1,
      orbitSpeed: 0.1,
      radius: 30,
      color: archDistro?.brandColor || '#1793d1',
      glowColor: 'rgba(23, 147, 209, 0.5)',
      glyph: 'ARC',
      rank: archDistro?.rank,
      x: 0,
      y: 0
    });

    // Moons of Arch: EndeavourOS (#3), Manjaro, Garuda, SteamOS, CachyOS, Artix
    const archMoons = ['endeavouros', 'manjaro', 'garuda', 'steamos', 'cachyos', 'artix'];
    archMoons.forEach((mId, idx) => {
      const d = distroMap.get(mId);
      if (d) {
        const moonRadius = 55 + (idx % 3) * 24;
        const speed = 0.45 + idx * 0.07;
        bodies.push({
          id: d.id,
          name: d.name,
          distro: d,
          isMoon: true,
          parentKey: 'arch',
          orbitRadius: moonRadius,
          currentAngle: (idx / archMoons.length) * Math.PI * 2,
          orbitSpeed: speed,
          radius: 18 + Math.min(11, Math.max(0, (d.hitsPerDay - 200) / 280)),
          color: d.brandColor || '#7f3f98',
          glowColor: `${d.brandColor}66`,
          glyph: d.logoGlyph,
          rank: d.rank,
          x: 0,
          y: 0
        });
      }
    });

    // Primary Planet: Fedora & Red Hat
    const fedoraDistro = distroMap.get('fedora');
    bodies.push({
      id: 'fedora',
      name: fedoraDistro?.name || 'Fedora',
      distro: fedoraDistro,
      isPlanet: true,
      parentKey: 'sun_linux',
      orbitRadius: 520,
      currentAngle: 3.8,
      orbitSpeed: 0.075,
      radius: 30,
      color: fedoraDistro?.brandColor || '#294172',
      glowColor: 'rgba(41, 65, 114, 0.5)',
      glyph: 'FED',
      rank: fedoraDistro?.rank,
      x: 0,
      y: 0
    });

    // Moons of Fedora / Red Hat: Rocky, Alma, Nobara, Silverblue, Bazzite, Mageia, PCLinuxOS, Qubes
    const fedoraMoons = ['rocky', 'almalinux', 'nobara', 'silverblue', 'bazzite', 'qubes', 'mageia', 'pclinuxos'];
    fedoraMoons.forEach((mId, idx) => {
      const d = distroMap.get(mId);
      if (d) {
        const moonRadius = 55 + (idx % 4) * 22;
        const speed = 0.42 + idx * 0.05;
        bodies.push({
          id: d.id,
          name: d.name,
          distro: d,
          isMoon: true,
          parentKey: 'fedora',
          orbitRadius: moonRadius,
          currentAngle: (idx / fedoraMoons.length) * Math.PI * 2,
          orbitSpeed: speed,
          radius: 17 + Math.min(9, Math.max(0, (d.hitsPerDay - 200) / 300)),
          color: d.brandColor || '#10b981',
          glowColor: `${d.brandColor}66`,
          glyph: d.logoGlyph,
          rank: d.rank,
          x: 0,
          y: 0
        });
      }
    });

    // Primary Planet: Slackware / openSUSE
    const suseDistro = distroMap.get('opensuse');
    bodies.push({
      id: 'opensuse',
      name: suseDistro?.name || 'openSUSE',
      distro: suseDistro,
      isPlanet: true,
      parentKey: 'sun_linux',
      orbitRadius: 680,
      currentAngle: 5.1,
      orbitSpeed: 0.06,
      radius: 28,
      color: suseDistro?.brandColor || '#73ba25',
      glowColor: 'rgba(115, 186, 37, 0.5)',
      glyph: 'SUSE',
      rank: suseDistro?.rank,
      x: 0,
      y: 0
    });

    const suseMoons = ['slackware'];
    suseMoons.forEach((mId, idx) => {
      const d = distroMap.get(mId);
      if (d) {
        bodies.push({
          id: d.id,
          name: d.name,
          distro: d,
          isMoon: true,
          parentKey: 'opensuse',
          orbitRadius: 60,
          currentAngle: 1.0,
          orbitSpeed: 0.4,
          radius: 20,
          color: d.brandColor || '#2b3a42',
          glowColor: `${d.brandColor}66`,
          glyph: d.logoGlyph,
          rank: d.rank,
          x: 0,
          y: 0
        });
      }
    });

    // Outer Independent Celestial Belt: NixOS, Alpine, Void, Gentoo, Solus, ClearLinux, Puppy, postmarketOS
    const independentDistros = ['nixos', 'alpine', 'gentoo', 'void', 'solus', 'clearlinux', 'puppy', 'postmarketos'];
    independentDistros.forEach((mId, idx) => {
      const d = distroMap.get(mId);
      if (d) {
        const ringRadius = 820 + (idx % 3) * 45;
        const speed = 0.045 + (idx % 4) * 0.01;
        bodies.push({
          id: d.id,
          name: d.name,
          distro: d,
          isPlanet: true,
          parentKey: 'sun_linux',
          orbitRadius: ringRadius,
          currentAngle: (idx / independentDistros.length) * Math.PI * 2,
          orbitSpeed: speed,
          radius: 19 + Math.min(8, Math.max(0, (d.hitsPerDay - 200) / 320)),
          color: d.brandColor || '#5277c3',
          glowColor: `${d.brandColor}66`,
          glyph: d.logoGlyph,
          rank: d.rank,
          x: 0,
          y: 0
        });
      }
    });

    return bodies;
  }, [distros]);

  // Main Solar System Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTime) * 0.001;
      lastTime = now;

      // 1. Advance celestial orbit angles
      if (isOrbiting) {
        for (const body of celestialBodies) {
          if (!body.isSun) {
            body.currentAngle += body.orbitSpeed * dt * speedMultiplier;
          }
        }
      }

      // 2. Compute absolute coordinate hierarchy:
      // Sun is at center (0, 0)
      // Planets resolve position from Sun
      // Moons resolve position from their parent planet!
      const bodyMap = new Map<string, CelestialBody>();
      for (const body of celestialBodies) {
        bodyMap.set(body.id, body);
      }

      for (const body of celestialBodies) {
        if (body.isSun) {
          body.x = 0;
          body.y = 0;
        } else if (body.parentKey) {
          const parent = bodyMap.get(body.parentKey);
          if (parent) {
            body.x = parent.x + Math.cos(body.currentAngle) * body.orbitRadius;
            body.y = parent.y + Math.sin(body.currentAngle) * body.orbitRadius;
          }
        }
      }

      // 3. Clear canvas & apply center viewport transforms
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      // Center galaxy at canvas middle
      const cx = width / 2;
      const cy = height / 2;
      ctx.translate(cx + transform.x, cy + transform.y);
      ctx.scale(transform.scale, transform.scale);

      // 4. Draw starry background dust
      drawStarfield(ctx, starfieldRef.current);

      // 5. Draw celestial orbital path rings
      if (showOrbitRings) {
        drawOrbitalTracks(ctx, celestialBodies, bodyMap);
      }

      // 6. Draw central Sun flares & corona
      drawSunCorona(ctx, now);

      // 7. Draw all celestial bodies (planets and moons)
      for (const body of celestialBodies) {
        drawCelestialBody(
          ctx,
          body,
          body.distro?.id === selectedDistro?.id,
          body.distro?.id === hoveredDistroId,
          now
        );
      }

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [celestialBodies, isOrbiting, speedMultiplier, showOrbitRings, selectedDistro, hoveredDistroId, transform]);

  // Draw starfield background
  const drawStarfield = (ctx: CanvasRenderingContext2D, stars: { x: number; y: number; size: number; alpha: number }[]) => {
    ctx.save();
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(226, 232, 240, ${s.alpha})`;
      ctx.fill();
    }
    ctx.restore();
  };

  // Draw orbital ellipse tracks
  const drawOrbitalTracks = (
    ctx: CanvasRenderingContext2D,
    bodies: CelestialBody[],
    bodyMap: Map<string, CelestialBody>
  ) => {
    ctx.save();

    for (const body of bodies) {
      if (body.isSun || !body.parentKey) continue;
      const parent = bodyMap.get(body.parentKey);
      if (!parent) continue;

      ctx.beginPath();
      ctx.arc(parent.x, parent.y, body.orbitRadius, 0, Math.PI * 2);

      if (body.isPlanet) {
        // Major planetary orbit track around Sun
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.09)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 6]);
      } else {
        // Lunar orbit track around parent planet
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 4]);
      }
      ctx.stroke();
    }

    ctx.restore();
  };

  // Draw central Sun (Linux Kernel) with radiant solar corona
  const drawSunCorona = (ctx: CanvasRenderingContext2D, now: number) => {
    ctx.save();
    const sunRadius = 42;
    const pulse = Math.sin(now * 0.003) * 4;

    // Outer solar corona glow
    const coronaGrad = ctx.createRadialGradient(0, 0, sunRadius * 0.5, 0, 0, sunRadius * 2.8 + pulse);
    coronaGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    coronaGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.18)');
    coronaGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

    ctx.beginPath();
    ctx.arc(0, 0, sunRadius * 2.8 + pulse, 0, Math.PI * 2);
    ctx.fillStyle = coronaGrad;
    ctx.fill();

    // Solar flares radiating out
    const numRays = 12;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2 + now * 0.0008;
      const rayLen = sunRadius + 16 + Math.sin(now * 0.004 + i) * 8;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * (sunRadius + 2), Math.sin(angle) * (sunRadius + 2));
      ctx.lineTo(Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
      ctx.stroke();
    }

    // Core Star Body
    const coreGrad = ctx.createRadialGradient(-10, -10, 5, 0, 0, sunRadius);
    coreGrad.addColorStop(0, '#fef08a');
    coreGrad.addColorStop(0.4, '#f59e0b');
    coreGrad.addColorStop(1, '#b45309');

    ctx.beginPath();
    ctx.arc(0, 0, sunRadius, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Solar text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LINUX', 0, -4);
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillText('1991', 0, 7);

    ctx.restore();
  };

  // Draw individual celestial body (Planet or Moon)
  const drawCelestialBody = (
    ctx: CanvasRenderingContext2D,
    body: CelestialBody,
    isSelected: boolean,
    isHovered: boolean,
    now: number
  ) => {
    if (body.isSun) return; // Sun handled separately

    const { x, y, radius, color, glowColor, glyph, name, rank, isPlanet } = body;
    const effectiveRadius = isHovered ? radius * 1.2 : isSelected ? radius * 1.15 : radius;

    ctx.save();

    // 1. Orbital gravitational glow
    if (isSelected || isHovered) {
      const pulseWave = Math.sin(now * 0.006) * 3;
      ctx.beginPath();
      ctx.arc(x, y, effectiveRadius + 10 + pulseWave, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.2)';
      ctx.fill();

      // Outer targeting reticle ring
      ctx.beginPath();
      ctx.arc(x, y, effectiveRadius + 6, 0, Math.PI * 2);
      ctx.strokeStyle = isSelected ? '#38bdf8' : '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (isPlanet) {
      // Planet atmospheric halo
      ctx.beginPath();
      ctx.arc(x, y, effectiveRadius + 5, 0, Math.PI * 2);
      ctx.fillStyle = glowColor;
      ctx.fill();
    }

    // 2. Body Sphere 3D Shading Gradient
    const grad = ctx.createRadialGradient(
      x - effectiveRadius * 0.35,
      y - effectiveRadius * 0.35,
      effectiveRadius * 0.1,
      x,
      y,
      effectiveRadius
    );
    grad.addColorStop(0, lightenColor(color, 45));
    grad.addColorStop(0.7, color);
    grad.addColorStop(1, darkenColor(color, 40));

    ctx.beginPath();
    ctx.arc(x, y, effectiveRadius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 3. Rim highlight
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.28)';
    ctx.stroke();

    // 4. DistroWatch Rank Pill on prominent planets/moons
    if (rank && rank <= 20 && effectiveRadius >= 18) {
      const bAngle = -Math.PI / 4;
      const bx = x + Math.cos(bAngle) * (effectiveRadius - 3);
      const by = y + Math.sin(bAngle) * (effectiveRadius - 3);

      ctx.beginPath();
      ctx.arc(bx, by, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#090d16';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`#${rank}`, bx, by);
    }

    // 5. Monogram Glyph / Label
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (effectiveRadius >= 24) {
      ctx.font = `bold ${Math.round(effectiveRadius * 0.4)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(glyph, x, y - 2);

      ctx.font = '500 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(name.slice(0, 10), x, y + effectiveRadius + 9);
    } else {
      ctx.font = `bold ${Math.round(effectiveRadius * 0.48)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(glyph, x, y);

      // Only show text label under moon on hover
      if (isHovered || isSelected) {
        ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(name, x, y + effectiveRadius + 10);
      }
    }

    ctx.restore();
  };

  // Screen coordinate to canvas coordinate conversion
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    return {
      x: (clientX - cx - transform.x) / transform.scale,
      y: (clientY - cy - transform.y) / transform.scale
    };
  };

  // Find celestial body at point
  const getBodyAt = (x: number, y: number): CelestialBody | null => {
    for (let i = celestialBodies.length - 1; i >= 0; i--) {
      const b = celestialBodies[i];
      const dx = x - b.x;
      const dy = y - b.y;
      if (dx * dx + dy * dy <= (b.radius + 6) * (b.radius + 6)) {
        return b;
      }
    }
    return null;
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const clicked = getBodyAt(x, y);

    if (clicked && clicked.distro) {
      playChimeSound(700);
      onSelectDistro(clicked.distro);
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    mousePosRef.current = coords;

    if (isPanning) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      }));
      return;
    }

    const hovered = getBodyAt(coords.x, coords.y);
    if (hovered && hovered.distro) {
      if (hovered.distro.id !== hoveredDistroId) {
        playPopSound(550, 0.02);
      }
      setHoveredDistroId(hovered.distro.id);
      if (canvasRef.current) canvasRef.current.style.cursor = 'pointer';
    } else {
      setHoveredDistroId(null);
      if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale * zoomFactor, 0.25), 2.2)
    }));
  };

  const handleReset = () => {
    setTransform({ x: 0, y: 0, scale: 0.85 });
    playPopSound(440, 0.02);
  };

  const hoveredDistro = distros.find((d) => d.id === hoveredDistroId);
  const hoveredCelestial = celestialBodies.find((b) => b.id === hoveredDistroId);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-slate-950 select-none"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Galactic Title & Legend HUD */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none p-3.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl max-w-xs shadow-2xl">
        <div className="flex items-center gap-2">
          <Orbit className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '16s' }} />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Linux Solar System & Orrery
          </h3>
        </div>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Distros revolve around their foundational ancestor stars. Click any planet or moon to inspect its lineage.
        </p>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-3 text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Central Star (Linux)</span>
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Moons (Forks)</span>
          </span>
        </div>
      </div>

      {/* Orrery Control Deck (Bottom Floating) */}
      <div className="absolute bottom-16 right-5 z-20 flex items-center gap-2 p-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl text-xs">
        {/* Play / Pause Orbit */}
        <button
          onClick={() => {
            setIsOrbiting(!isOrbiting);
            playPopSound(500, 0.02);
          }}
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-1.5 font-medium"
        >
          {isOrbiting ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{isOrbiting ? 'Pause Orbit' : 'Resume'}</span>
        </button>

        {/* Orbit Speed Multiplier */}
        <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[11px] font-mono">
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => {
                setSpeedMultiplier(s);
                playPopSound(460, 0.02);
              }}
              className={`px-2 py-1 rounded transition-colors ${
                speedMultiplier === s
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Toggle Orbit Rings */}
        <button
          onClick={() => setShowOrbitRings(!showOrbitRings)}
          className={`px-2 py-1.5 rounded-lg border text-[11px] transition-colors ${
            showOrbitRings
              ? 'bg-slate-800 border-slate-700 text-cyan-300'
              : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}
          title="Toggle celestial orbit trajectory rings"
        >
          Rings
        </button>

        <div className="w-px h-5 bg-slate-800" />

        {/* Zoom Controls */}
        <button
          onClick={() => setTransform((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.2, 2.2) }))}
          className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setTransform((prev) => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.25) }))}
          className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={handleReset}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px] transition-colors"
          title="Center Galaxy"
        >
          Reset
        </button>
      </div>

      {/* Hover Celestial Telemetry HUD */}
      {hoveredDistro && hoveredCelestial && (
        <div className="pointer-events-none absolute bottom-16 left-4 z-20 max-w-sm p-3.5 bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded-xl shadow-2xl transition-all">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: hoveredDistro.brandColor }}
              />
              <h4 className="font-bold text-sm text-white">
                {hoveredDistro.name}
              </h4>
            </div>
            <span className="font-mono text-xs font-semibold text-cyan-400">
              #{hoveredDistro.rank} DistroWatch
            </span>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 mb-2 leading-relaxed">
            {hoveredDistro.tagline}
          </p>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Parent Star: {hoveredDistro.basedOn[0] || 'Linux Kernel'}</span>
            <span>·</span>
            <span>{hoveredDistro.hitsPerDay} HPD</span>
            <span>·</span>
            <span>{hoveredDistro.packageManager}</span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Orbit: {hoveredCelestial.isPlanet ? 'Primary Planetary Orbit' : 'Lunar Offshoot'}</span>
            <span className="text-cyan-400">Click to Open Specs &rarr;</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Color adjustments for 3D sphere gradients
function lightenColor(hex: string, amt: number): string {
  let num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) num = 0x3b82f6;
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `rgb(${R}, ${G}, ${B})`;
}

function darkenColor(hex: string, amt: number): string {
  let num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) num = 0x3b82f6;
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `rgb(${R}, ${G}, ${B})`;
}
