export type DistroFamily = 
  | 'Debian'
  | 'Ubuntu'
  | 'Arch'
  | 'Red Hat / Fedora'
  | 'Slackware / SUSE'
  | 'Independent';

export type ReleaseModel = 'Fixed Point' | 'Rolling' | 'Semi-Rolling' | 'Immutable';

export type Category = 
  | 'Beginner'
  | 'Beginners'
  | 'Desktop'
  | 'Server'
  | 'Gaming'
  | 'Security & Forensics'
  | 'Lightweight'
  | 'Specialist'
  | 'Immutable / Atomic'
  | 'Live Medium'
  | string;

export type InitSystem = 
  | 'systemd'
  | 'OpenRC'
  | 'runit'
  | 's6'
  | 'sysvinit'
  | string;

export interface RankingHistoryPoint {
  month: string;
  rank: number;
  hitsPerDay: number;
}

export interface Distro {
  id: string;
  name: string;
  tagline: string;
  rank: number; // DistroWatch Rank (1 = highest)
  hitsPerDay: number; // DistroWatch HPD
  trend: 'up' | 'down' | 'steady';
  rankingHistory?: RankingHistoryPoint[];
  basedOn: string[]; // e.g. ["Debian", "Ubuntu"]
  parentId: string | null; // direct genealogical parent id (e.g. 'ubuntu' for mint, 'debian' for ubuntu)
  family: DistroFamily;
  originCountry: string;
  countryCode: string; // ISO 2-letter for flag
  firstReleaseYear: number;
  latestVersion: string;
  category: Category[];
  desktopEnvironments: string[];
  packageManager: string; // e.g. "apt", "pacman", "dnf", "nix"
  packageInstallCmd: string; // e.g. "sudo apt install"
  initSystem: InitSystem;
  releaseModel: ReleaseModel;
  architectures: string[];
  defaultFs: string;
  minRamGb: number;
  description: string;
  philosophy: string;
  distroWatchUrl: string;
  websiteUrl: string;
  docsUrl?: string;
  forumUrl?: string;
  brandColor: string; // Hex color for bubble & highlights
  accentColor: string;
  logoGlyph: string; // Short symbol or acronym (e.g. "MX", "Mint", "Arch")
  featured?: boolean;
}

export type ClusterMode = 'family' | 'rank' | 'packageManager' | 'releaseModel' | 'free';

export interface FilterState {
  searchQuery: string;
  family: DistroFamily | 'All';
  category: string;
  releaseModel: string;
  sortBy: 'rank' | 'hits' | 'name' | 'year';
}

export interface LineageTreeNode {
  id: string;
  name: string;
  year?: number;
  family?: DistroFamily;
  isTarget?: boolean;
  isAncestor?: boolean;
  isChild?: boolean;
  children: LineageTreeNode[];
}
