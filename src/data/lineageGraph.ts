import { Distro, LineageTreeNode } from '../types/distro';
import { DISTROS_DATA, PRIMORDIAL_NODES } from './distros';

export interface AncestorStep {
  id: string;
  name: string;
  year?: number;
  family?: string;
  isDistro: boolean;
  desc?: string;
}

export function getDistroById(id: string): Distro | undefined {
  return DISTROS_DATA.find((d) => d.id === id);
}

/**
 * Returns the full ancestor chain from the primordial ancestor down to the target distro.
 * e.g. [UNIX (1969), Linux Kernel (1991), Debian (1993), Ubuntu (2004), Linux Mint (2006)]
 */
export function getAncestorChain(distroId: string): AncestorStep[] {
  const chain: AncestorStep[] = [];
  const visited = new Set<string>();

  let currentId: string | null = distroId;

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);

    const distro = getDistroById(currentId);
    if (distro) {
      chain.unshift({
        id: distro.id,
        name: distro.name,
        year: distro.firstReleaseYear,
        family: distro.family,
        isDistro: true,
        desc: distro.tagline
      });
      currentId = distro.parentId;
    } else if (PRIMORDIAL_NODES[currentId]) {
      const primordial = PRIMORDIAL_NODES[currentId];
      chain.unshift({
        id: currentId,
        name: primordial.name,
        year: primordial.year,
        isDistro: false,
        desc: primordial.desc
      });

      // Chain upward from primordial parents if defined
      if (currentId === 'mandriva' || currentId === 'fedora') {
        currentId = 'redhat';
      } else if (currentId === 'rhel') {
        currentId = 'fedora';
      } else if (currentId === 'suse') {
        currentId = 'slackware';
      } else if (currentId === 'redhat' || currentId === 'slackware') {
        currentId = 'linux';
      } else if (currentId === 'linux') {
        currentId = 'unix';
      } else {
        currentId = null;
      }
    } else {
      break;
    }
  }

  // Ensure UNIX is always root if Linux was reached
  if (chain.length > 0 && chain[0].id === 'linux') {
    chain.unshift({
      id: 'unix',
      name: PRIMORDIAL_NODES.unix.name,
      year: PRIMORDIAL_NODES.unix.year,
      isDistro: false,
      desc: PRIMORDIAL_NODES.unix.desc
    });
  }

  return chain;
}

/**
 * Returns all direct child distros (forks/derivatives) of the specified distro ID.
 */
export function getDirectChildren(distroId: string): Distro[] {
  return DISTROS_DATA.filter((d) => d.parentId === distroId);
}

/**
 * Returns all sibling distros (those sharing the same direct parent).
 */
export function getSiblings(distro: Distro): Distro[] {
  if (!distro.parentId) return [];
  return DISTROS_DATA.filter((d) => d.parentId === distro.parentId && d.id !== distro.id);
}

/**
 * Builds an interactive hierarchical tree centered on the target distro:
 * Ancestor Path -> Target Distro -> Direct Forks & Child Derivatives
 */
export function buildDistroLineageTree(targetDistroId: string): LineageTreeNode {
  const ancestors = getAncestorChain(targetDistroId);
  const target = getDistroById(targetDistroId);
  const children = getDirectChildren(targetDistroId);

  // If no ancestors found, return a single node
  if (ancestors.length === 0) {
    return {
      id: targetDistroId,
      name: target?.name || targetDistroId,
      year: target?.firstReleaseYear,
      family: target?.family,
      isTarget: true,
      children: []
    };
  }

  // Build tree from root ancestor downward to target
  let rootNode: LineageTreeNode = {
    id: ancestors[0].id,
    name: ancestors[0].name,
    year: ancestors[0].year,
    isAncestor: true,
    children: []
  };

  let currentNode = rootNode;

  for (let i = 1; i < ancestors.length; i++) {
    const step = ancestors[i];
    const isTarget = step.id === targetDistroId;
    const childNode: LineageTreeNode = {
      id: step.id,
      name: step.name,
      year: step.year,
      family: step.family as any,
      isTarget,
      isAncestor: !isTarget,
      children: []
    };
    currentNode.children = [childNode];
    currentNode = childNode;
  }

  // Attach direct derivative children to the target node
  if (children.length > 0) {
    currentNode.children = children.map((c) => ({
      id: c.id,
      name: c.name,
      year: c.firstReleaseYear,
      family: c.family,
      isChild: true,
      children: getDirectChildren(c.id).map((gc) => ({
        id: gc.id,
        name: gc.name,
        year: gc.firstReleaseYear,
        family: gc.family,
        isChild: true,
        children: []
      }))
    }));
  }

  return rootNode;
}

/**
 * Lineage stats for families
 */
export function getFamilyStatistics() {
  const counts: Record<string, { count: number; totalHpd: number; color: string }> = {
    Debian: { count: 0, totalHpd: 0, color: '#d70a53' },
    Ubuntu: { count: 0, totalHpd: 0, color: '#e95420' },
    Arch: { count: 0, totalHpd: 0, color: '#1793d1' },
    'Red Hat / Fedora': { count: 0, totalHpd: 0, color: '#294172' },
    'Slackware / SUSE': { count: 0, totalHpd: 0, color: '#73ba25' },
    Independent: { count: 0, totalHpd: 0, color: '#5277c3' }
  };

  DISTROS_DATA.forEach((d) => {
    if (counts[d.family]) {
      counts[d.family].count += 1;
      counts[d.family].totalHpd += d.hitsPerDay;
    }
  });

  return counts;
}
