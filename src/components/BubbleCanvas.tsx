import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Distro, ClusterMode } from '../types/distro';
import { playPopSound, playChimeSound } from '../utils/audio';

interface BubbleNode {
  distro: Distro;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  targetX: number;
  targetY: number;
  pulsePhase: number; // for organic breathing
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

interface BubbleCanvasProps {
  distros: Distro[];
  selectedDistro: Distro | null;
  onSelectDistro: (distro: Distro) => void;
  clusterMode: ClusterMode;
  hoveredDistroId: string | null;
  setHoveredDistroId: (id: string | null) => void;
  pulseDistroId?: string | null;
}

export const BubbleCanvas: React.FC<BubbleCanvasProps> = ({
  distros,
  selectedDistro,
  onSelectDistro,
  clusterMode,
  hoveredDistroId,
  setHoveredDistroId,
  pulseDistroId
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport transforms (Pan & Zoom)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Mouse coordinate for magnetic ripple
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Dragging bubble
  const draggedNodeRef = useRef<BubbleNode | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const nodesRef = useRef<BubbleNode[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const particlesRef = useRef<StarParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Calculate base radius based on DistroWatch HitsPerDay and Rank
  const calculateRadius = (d: Distro): number => {
    const normalized = Math.min(Math.max((d.hitsPerDay - 150) / 2700, 0), 1);
    return 32 + normalized * 36;
  };

  // Initialize starfield ambient dust particles
  useEffect(() => {
    const particles: StarParticle[] = [];
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 2400,
        y: (Math.random() - 0.5) * 1800,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.4 + 0.15
      });
    }
    particlesRef.current = particles;
  }, []);

  // Listen for live external pulse events
  useEffect(() => {
    if (!pulseDistroId) return;
    const targetNode = nodesRef.current.find((n) => n.distro.id === pulseDistroId);
    if (targetNode) {
      shockwavesRef.current.push({
        x: targetNode.x,
        y: targetNode.y,
        radius: targetNode.radius,
        maxRadius: targetNode.radius + 65,
        alpha: 0.9,
        color: targetNode.distro.accentColor || '#38bdf8'
      });
    }
  }, [pulseDistroId]);

  // Initialize nodes when distros change
  useEffect(() => {
    const width = containerRef.current?.clientWidth || 1000;
    const height = containerRef.current?.clientHeight || 700;
    const centerX = width / 2;
    const centerY = height / 2;

    const existingMap = new Map(nodesRef.current.map((n) => [n.distro.id, n]));

    const newNodes: BubbleNode[] = distros.map((d, index) => {
      const radius = calculateRadius(d);
      const existing = existingMap.get(d.id);

      if (existing) {
        return {
          ...existing,
          distro: d,
          radius,
          baseRadius: radius
        };
      }

      // Initial placement
      const angle = (index / distros.length) * Math.PI * 2;
      const distance = 100 + (index * 7) % 250;
      return {
        distro: d,
        x: centerX + Math.cos(angle) * distance + (Math.random() - 0.5) * 50,
        y: centerY + Math.sin(angle) * distance + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius,
        baseRadius: radius,
        targetX: centerX,
        targetY: centerY,
        pulsePhase: Math.random() * Math.PI * 2
      };
    });

    nodesRef.current = newNodes;
  }, [distros]);

  // Compute cluster attractor targets
  const updateClusterTargets = useCallback((width: number, height: number) => {
    const cx = width / 2;
    const cy = height / 2;
    const nodes = nodesRef.current;

    if (clusterMode === 'family') {
      const familyTargets: Record<string, { x: number; y: number }> = {
        Debian: { x: cx - width * 0.28, y: cy - height * 0.22 },
        Ubuntu: { x: cx - width * 0.26, y: cy + height * 0.22 },
        Arch: { x: cx + width * 0.28, y: cy - height * 0.22 },
        'Red Hat / Fedora': { x: cx + width * 0.28, y: cy + height * 0.22 },
        'Slackware / SUSE': { x: cx, y: cy - height * 0.32 },
        Independent: { x: cx, y: cy + height * 0.28 }
      };

      nodes.forEach((node) => {
        const target = familyTargets[node.distro.family] || { x: cx, y: cy };
        node.targetX = target.x;
        node.targetY = target.y;
      });
    } else if (clusterMode === 'rank') {
      // Golden Spiral by DistroWatch Rank
      const sorted = [...nodes].sort((a, b) => a.distro.rank - b.distro.rank);
      sorted.forEach((node, idx) => {
        const angle = idx * 0.75;
        const radius = 45 + Math.sqrt(idx) * 48;
        node.targetX = cx + Math.cos(angle) * radius;
        node.targetY = cy + Math.sin(angle) * radius;
      });
    } else if (clusterMode === 'packageManager') {
      const pkgTargets: Record<string, { x: number; y: number }> = {
        apt: { x: cx - width * 0.28, y: cy },
        pacman: { x: cx + width * 0.28, y: cy - height * 0.2 },
        dnf: { x: cx + width * 0.28, y: cy + height * 0.2 },
        zypper: { x: cx, y: cy - height * 0.3 },
        other: { x: cx, y: cy + height * 0.25 }
      };

      nodes.forEach((node) => {
        const pkg = node.distro.packageManager.toLowerCase();
        let targetKey = 'other';
        if (pkg.includes('apt')) targetKey = 'apt';
        else if (pkg.includes('pacman')) targetKey = 'pacman';
        else if (pkg.includes('dnf')) targetKey = 'dnf';
        else if (pkg.includes('zypper')) targetKey = 'zypper';

        const target = pkgTargets[targetKey] || { x: cx, y: cy };
        node.targetX = target.x;
        node.targetY = target.y;
      });
    } else if (clusterMode === 'releaseModel') {
      const modelTargets: Record<string, { x: number; y: number }> = {
        'Fixed Point': { x: cx - width * 0.25, y: cy },
        Rolling: { x: cx + width * 0.25, y: cy },
        'Semi-Rolling': { x: cx, y: cy - height * 0.28 },
        Immutable: { x: cx, y: cy + height * 0.28 }
      };

      nodes.forEach((node) => {
        const target = modelTargets[node.distro.releaseModel] || { x: cx, y: cy };
        node.targetX = target.x;
        node.targetY = target.y;
      });
    } else {
      nodes.forEach((node) => {
        node.targetX = cx;
        node.targetY = cy;
      });
    }
  }, [clusterMode]);

  // Main Physics Simulation and Render Loop
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

    let startTime = performance.now();

    const runSimulation = (now: number) => {
      const elapsed = (now - startTime) * 0.001;
      const nodes = nodesRef.current;
      const shockwaves = shockwavesRef.current;
      const particles = particlesRef.current;

      updateClusterTargets(width, height);

      // 1. Organic breathing radius animation
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        // Organic pulse wave based on hitsPerDay
        const breathingFactor = Math.sin(now * 0.0022 + node.pulsePhase) * 1.8;
        node.radius = Math.max(20, node.baseRadius + breathingFactor);
      }

      // 2. Ambient particle update
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -1200) p.x = 1200;
        if (p.x > 1200) p.x = -1200;
        if (p.y < -900) p.y = 900;
        if (p.y > 900) p.y = -900;
      }

      // 3. Shockwave lifecycle update
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 1.8;
        sw.alpha -= 0.022;
        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
        }
      }

      // 4. Physics forces & collision resolution
      const gravityStrength = clusterMode === 'free' ? 0.0006 : 0.0035;
      const damping = 0.88;
      const mouse = mousePosRef.current;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node === draggedNodeRef.current) continue;

        // Attractor force to cluster target
        const dx = node.targetX - node.x;
        const dy = node.targetY - node.y;
        node.vx += dx * gravityStrength;
        node.vy += dy * gravityStrength;

        // Mouse elastic repulsion field
        if (mouse) {
          const mdx = node.x - mouse.x;
          const mdy = node.y - mouse.y;
          const mdistSq = mdx * mdx + mdy * mdy;
          const mouseRadius = 90;
          if (mdistSq < mouseRadius * mouseRadius && mdistSq > 1) {
            const mdist = Math.sqrt(mdistSq);
            const force = (1 - mdist / mouseRadius) * 0.35;
            node.vx += (mdx / mdist) * force;
            node.vy += (mdy / mdist) * force;
          }
        }

        // Ambient gentle drift
        node.vx += Math.sin(now * 0.001 + i) * 0.04;
        node.vy += Math.cos(now * 0.001 + i) * 0.04;

        // Bubble-to-bubble collision
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const distDx = other.x - node.x;
          const distDy = other.y - node.y;
          const distSq = distDx * distDx + distDy * distDy;
          const minDist = node.radius + other.radius + 6;

          if (distSq < minDist * minDist && distSq > 0.001) {
            const distance = Math.sqrt(distSq);
            const overlap = (minDist - distance) * 0.5;
            const nx = distDx / distance;
            const ny = distDy / distance;

            // Spawn collision shockwave if impactful impact
            const relVel = Math.abs(node.vx - other.vx) + Math.abs(node.vy - other.vy);
            if (relVel > 1.8 && shockwaves.length < 8) {
              shockwaves.push({
                x: (node.x + other.x) * 0.5,
                y: (node.y + other.y) * 0.5,
                radius: 12,
                maxRadius: 38,
                alpha: 0.6,
                color: 'rgba(56, 189, 248, 0.7)'
              });
              playPopSound(350 + Math.random() * 200, 0.02);
            }

            // Separate nodes
            if (node !== draggedNodeRef.current) {
              node.x -= nx * overlap * 0.45;
              node.y -= ny * overlap * 0.45;
              node.vx -= nx * 0.2;
              node.vy -= ny * 0.2;
            }
            if (other !== draggedNodeRef.current) {
              other.x += nx * overlap * 0.45;
              other.y += ny * overlap * 0.45;
              other.vx += nx * 0.2;
              other.vy += ny * 0.2;
            }
          }
        }

        // Apply velocity with damping
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;

        // Soft canvas bounds
        const pad = node.radius + 10;
        if (node.x < pad) { node.x = pad; node.vx *= -0.5; }
        if (node.x > width - pad) { node.x = width - pad; node.vx *= -0.5; }
        if (node.y < pad) { node.y = pad; node.vy *= -0.5; }
        if (node.y > height - pad) { node.y = height - pad; node.vy *= -0.5; }
      }

      // 5. Render Scene
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      // Apply pan & zoom
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.scale, transform.scale);

      // Draw background ambient starfield
      drawAmbientStarfield(ctx, particles);

      // Draw subtle background grid constellation
      drawBackgroundGrid(ctx, width, height);

      // Draw animated kinship lines with energy flow pulses
      drawLivingKinshipLines(ctx, nodes, now);

      // Draw shockwave ripples
      drawShockwaves(ctx, shockwaves);

      // Draw each bubble node
      for (const node of nodes) {
        drawBubbleNode(
          ctx,
          node,
          node.distro.id === selectedDistro?.id,
          node.distro.id === hoveredDistroId,
          now
        );
      }

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(runSimulation);
    };

    animationFrameRef.current = requestAnimationFrame(runSimulation);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [clusterMode, selectedDistro, hoveredDistroId, transform, updateClusterTargets]);

  // Draw ambient floating dust starfield
  const drawAmbientStarfield = (ctx: CanvasRenderingContext2D, particles: StarParticle[]) => {
    ctx.save();
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
      ctx.fill();
    }
    ctx.restore();
  };

  // Draw delicate grid pattern
  const drawBackgroundGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.035)';
    ctx.lineWidth = 1;

    const step = 60;
    const startX = -1200;
    const endX = w + 1200;
    const startY = -1200;
    const endY = h + 1200;

    ctx.beginPath();
    for (let x = startX; x < endX; x += step) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y < endY; y += step) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();
  };

  // Draw living kinship lines with traveling energy pulses
  const drawLivingKinshipLines = (
    ctx: CanvasRenderingContext2D,
    nodes: BubbleNode[],
    now: number
  ) => {
    ctx.save();
    ctx.lineWidth = 1;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      if (!a.distro.parentId) continue;

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const isParentChild = b.distro.id === a.distro.parentId || a.distro.id === b.distro.parentId;
        const isSibling = a.distro.parentId === b.distro.parentId;

        if (isParentChild || isSibling) {
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 280) {
            const alpha = Math.max(0.02, (1 - dist / 280) * 0.22);
            ctx.strokeStyle = isParentChild
              ? `rgba(56, 189, 248, ${alpha * 1.6})`
              : `rgba(148, 163, 184, ${alpha})`;
            ctx.setLineDash(isParentChild ? [] : [2, 4]);

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            // Energy packet particle traveling along line
            if (isParentChild) {
              const speed = 0.0006;
              const t = (now * speed + (i * 0.17)) % 1;
              const px = a.x + dx * t;
              const py = a.y + dy * t;

              ctx.beginPath();
              ctx.arc(px, py, 1.8, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
              ctx.fill();
            }
          }
        }
      }
    }
    ctx.restore();
  };

  // Draw shockwaves
  const drawShockwaves = (ctx: CanvasRenderingContext2D, shockwaves: Shockwave[]) => {
    ctx.save();
    for (const sw of shockwaves) {
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = sw.alpha;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  };

  // Draw individual bubble node with organic living glow
  const drawBubbleNode = (
    ctx: CanvasRenderingContext2D,
    node: BubbleNode,
    isSelected: boolean,
    isHovered: boolean,
    now: number
  ) => {
    const { x, y, radius, distro } = node;
    const effectiveRadius = isHovered ? radius * 1.1 : isSelected ? radius * 1.06 : radius;

    ctx.save();

    // 1. Organic Outer Glow / Halo
    if (isSelected || isHovered) {
      const pulseWave = Math.sin(now * 0.005) * 3;
      ctx.beginPath();
      ctx.arc(x, y, effectiveRadius + 10 + pulseWave, 0, Math.PI * 2);
      ctx.fillStyle = isSelected
        ? 'rgba(56, 189, 248, 0.28)'
        : 'rgba(255, 255, 255, 0.16)';
      ctx.fill();

      // Orbital indicator ring
      ctx.beginPath();
      ctx.arc(x, y, effectiveRadius + 5 + pulseWave * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = isSelected ? '#38bdf8' : distro.accentColor || '#94a3b8';
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.stroke();
    }

    // 2. Bubble Body Gradient
    const gradient = ctx.createRadialGradient(
      x - effectiveRadius * 0.3,
      y - effectiveRadius * 0.3,
      effectiveRadius * 0.1,
      x,
      y,
      effectiveRadius
    );

    const baseHex = distro.brandColor || '#334155';
    gradient.addColorStop(0, adjustColorBrightness(baseHex, 35));
    gradient.addColorStop(0.75, baseHex);
    gradient.addColorStop(1, adjustColorBrightness(baseHex, -35));

    ctx.beginPath();
    ctx.arc(x, y, effectiveRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 3. Subtle Inner Rim Border
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeStyle = isSelected
      ? 'rgba(255, 255, 255, 0.85)'
      : 'rgba(255, 255, 255, 0.18)';
    ctx.stroke();

    // 4. DistroWatch Rank Pill on Top-Right of bubble
    const badgeAngle = -Math.PI / 4;
    const badgeX = x + Math.cos(badgeAngle) * (effectiveRadius - 6);
    const badgeY = y + Math.sin(badgeAngle) * (effectiveRadius - 6);

    ctx.beginPath();
    ctx.arc(badgeX, badgeY, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`#${distro.rank}`, badgeX, badgeY);

    // 5. Central Monogram / Name
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (effectiveRadius > 44) {
      ctx.font = `bold ${Math.round(effectiveRadius * 0.32)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(distro.logoGlyph || distro.name.slice(0, 3).toUpperCase(), x, y - 8);

      ctx.font = `600 11px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillText(truncateText(distro.name, 14), x, y + 10);

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(`${distro.hitsPerDay} HPD`, x, y + 22);
    } else {
      ctx.font = `bold ${Math.round(effectiveRadius * 0.36)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(distro.logoGlyph || distro.name.slice(0, 3).toUpperCase(), x, y - 4);

      ctx.font = `500 10px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(truncateText(distro.name, 10), x, y + 10);
    }

    ctx.restore();
  };

  // Coordinate conversion helpers taking pan & zoom into account
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    return {
      x: (clientX - transform.x) / transform.scale,
      y: (clientY - transform.y) / transform.scale
    };
  };

  // Find node at coordinate
  const getNodeAt = (x: number, y: number): BubbleNode | null => {
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const dx = x - node.x;
      const dy = y - node.y;
      if (dx * dx + dy * dy <= node.radius * node.radius) {
        return node;
      }
    }
    return null;
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const clickedNode = getNodeAt(x, y);

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
      dragOffsetRef.current = { x: clickedNode.x - x, y: clickedNode.y - y };
      playPopSound(480, 0.04);
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    mousePosRef.current = coords;

    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = coords.x + dragOffsetRef.current.x;
      draggedNodeRef.current.y = coords.y + dragOffsetRef.current.y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
      return;
    }

    if (isPanning) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      }));
      return;
    }

    const hovered = getNodeAt(coords.x, coords.y);
    if (hovered) {
      if (hovered.distro.id !== hoveredDistroId) {
        playPopSound(600, 0.015);
      }
      setHoveredDistroId(hovered.distro.id);
      if (canvasRef.current) canvasRef.current.style.cursor = 'pointer';
    } else {
      setHoveredDistroId(null);
      if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    mousePosRef.current = null;
    setHoveredDistroId(null);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNodeRef.current) {
      playChimeSound(680);
      onSelectDistro(draggedNodeRef.current.distro);
      draggedNodeRef.current = null;
    }
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setTransform((prev) => {
      const newScale = Math.min(Math.max(prev.scale * zoomFactor, 0.4), 2.5);
      return { ...prev, scale: newScale };
    });
  };

  // Zoom control helpers
  const handleZoomIn = () => {
    setTransform((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.2, 2.5) }));
    playPopSound(500, 0.02);
  };

  const handleZoomOut = () => {
    setTransform((prev) => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.4) }));
    playPopSound(420, 0.02);
  };

  const handleResetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
    playPopSound(440, 0.02);
  };

  const hoveredDistro = distros.find((d) => d.id === hoveredDistroId);

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
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Floating Canvas Viewport Controls */}
      <div className="absolute bottom-16 right-5 flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg shadow-xl z-10 text-xs">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors font-mono font-bold"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors font-mono font-bold"
        >
          -
        </button>
        <div className="w-px h-4 bg-slate-800" />
        <button
          onClick={handleResetView}
          title="Reset View"
          className="px-2.5 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors font-medium whitespace-nowrap"
        >
          {Math.round(transform.scale * 100)}% · Reset
        </button>
      </div>

      {/* Quick Interactive Hover HUD Tooltip */}
      {hoveredDistro && (
        <div className="pointer-events-none absolute top-4 left-4 max-w-sm p-3.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl z-20 transition-all duration-150">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: hoveredDistro.brandColor }}
              />
              <h4 className="font-semibold text-sm text-white tracking-tight">
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
            <span>Base: {hoveredDistro.basedOn.join(', ')}</span>
            <span aria-hidden="true">·</span>
            <span>{hoveredDistro.hitsPerDay} HPD</span>
            <span aria-hidden="true">·</span>
            <span>{hoveredDistro.packageManager}</span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            {Boolean(localStorage.getItem(`distrosphere_user_notes_${hoveredDistro.id}`)) ? (
              <span className="text-amber-300 font-mono">★ Has personal notes</span>
            ) : (
              <span>Click bubble to view details</span>
            )}
            <span className="text-cyan-400">View Info &rarr;</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Utilities for color shading
function adjustColorBrightness(hex: string, percent: number): string {
  let num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) num = 0x334155;
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function truncateText(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}
