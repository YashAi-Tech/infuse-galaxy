/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum ObjectType {
  OBSTACLE = 'OBSTACLE',
  GEM = 'GEM',
  LETTER = 'LETTER',
  SHOP_PORTAL = 'SHOP_PORTAL',
  ALIEN = 'ALIEN',
  MISSILE = 'MISSILE',
  POWERUP_SPEED = 'POWERUP_SPEED',
  POWERUP_SHIELD = 'POWERUP_SHIELD'
}

export interface GameObject {
  id: string;
  type: ObjectType;
  position: [number, number, number]; // x, y, z
  active: boolean;
  value?: string; // For letters (G, A, L...)
  color?: string;
  targetIndex?: number; // Index in the GALAXY target word
  points?: number; // Score value for gems
  hasFired?: boolean; // For Aliens
}

export const LANE_WIDTH = 2.2;
export const JUMP_HEIGHT = 2.5;
export const JUMP_DURATION = 0.6; // seconds
export const RUN_SPEED_BASE = 22.5;
export const SPAWN_DISTANCE = 120;
export const REMOVE_DISTANCE = 20; // Behind player

// Cosmic Neon Colors: Pink, Magenta, Purple, Cyan, Orange, Gold
export const GALAXY_COLORS = [
    '#ff007f', // G - Pink
    '#e0115f', // A - Ruby/Magenta
    '#8a2be2', // L - Purple
    '#00ffff', // A - Cyan
    '#ff5f1f', // X - Neon Orange
    '#ffd700', // Y - Gold
];

export const LEVEL_KEYWORDS = [
  ['N', 'E', 'O', 'N'],             // Level 1: NEON
  ['C', 'O', 'S', 'M', 'O', 'S'],   // Level 2: COSMOS
  ['G', 'A', 'L', 'A', 'X', 'Y'],   // Level 3: GALAXY
  ['H', 'Y', 'P', 'E', 'R'],         // Level 4: HYPER
  ['I', 'N', 'F', 'I', 'N', 'I', 'T', 'Y'] // Level 5: INFINITY
];

export const getNeonColorForIndex = (index: number) => {
  const colors = ['#ff007f', '#00ffff', '#8a2be2', '#ffd700', '#ff5f1f', '#00ffaa', '#e0115f', '#ff00ff'];
  return colors[index % colors.length];
};

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: any; // Lucide icon component
    oneTime?: boolean; // If true, remove from pool after buying
}

export interface SkinData {
  id: string;
  name: string;
  armorColor: string;
  glowColor: string;
  jointColor: string;
  description: string;
}

export const CUSTOM_SKINS: SkinData[] = [
  {
    id: 'cyber_cyan',
    name: 'Cyber Cyan',
    armorColor: '#00aaff',
    glowColor: '#00ffff',
    jointColor: '#111111',
    description: 'Standard-issue deep space scout suit with cyan neon grid markers.'
  },
  {
    id: 'nova_pink',
    name: 'Nova Pink',
    armorColor: '#ff007f',
    glowColor: '#ffd700',
    jointColor: '#1c051a',
    description: 'Energetic high-vibrancy shell forged from dying star plasma.'
  },
  {
    id: 'void_gold',
    name: 'Void Gold',
    armorColor: '#18181b',
    glowColor: '#ffd700',
    jointColor: '#ffd700',
    description: 'Elite carbon-alloy armor trimmed with refined cosmic gold plating.'
  },
  {
    id: 'plasma_mint',
    name: 'Plasma Mint',
    armorColor: '#00ffaa',
    glowColor: '#bf55ec',
    jointColor: '#0d0d1a',
    description: 'Toxic sector gas shield with high-voltage purple plasma cells.'
  }
];

export interface MapData {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  speedMultiplier: number;
  obstacleFrequency: number;
  bgColor: string;
  starColor: string;
  sunColorTop: string;
  sunColorBottom: string;
  gridColor: string;
  laneColor: string;
  ambientColor: string;
  dirLightColor: string;
  pointLightColor: string;
}

export const CUSTOM_MAPS: MapData[] = [
  {
    id: 'andromeda',
    name: 'Andromeda Path',
    description: 'Classic synthwave cruise through neon cosmic dust and violet solar lanes.',
    difficulty: 'Normal',
    speedMultiplier: 1.0,
    obstacleFrequency: 1.0,
    bgColor: '#050011',
    starColor: '#ffffff',
    sunColorTop: '#ffe600',
    sunColorBottom: '#ff0077',
    gridColor: '#8800ff',
    laneColor: '#00ffff',
    ambientColor: '#400080',
    dirLightColor: '#00ffff',
    pointLightColor: '#ff00aa'
  },
  {
    id: 'neontokyo',
    name: 'Neon Tokyo Grid',
    description: 'A high-speed cybernetic channel above a futuristic megacity. High acceleration.',
    difficulty: 'Hard',
    speedMultiplier: 1.25,
    obstacleFrequency: 0.9,
    bgColor: '#02000c',
    starColor: '#00ffcc',
    sunColorTop: '#00f0ff',
    sunColorBottom: '#7000ff',
    gridColor: '#00f0ff',
    laneColor: '#ff0077',
    ambientColor: '#100040',
    dirLightColor: '#00f0ff',
    pointLightColor: '#ff00ff'
  },
  {
    id: 'solarflare',
    name: 'Solar Flare Orbit',
    description: 'Brave the heat waves and high density asteroid belts around a dying star.',
    difficulty: 'Challenging',
    speedMultiplier: 0.9,
    obstacleFrequency: 1.35,
    bgColor: '#0c0000',
    starColor: '#ff6600',
    sunColorTop: '#ffcc00',
    sunColorBottom: '#ff0000',
    gridColor: '#ff3300',
    laneColor: '#ffaa00',
    ambientColor: '#500000',
    dirLightColor: '#ffaa00',
    pointLightColor: '#ff5500'
  },
  {
    id: 'voidabyss',
    name: 'Void Abyss Sector',
    description: 'Monochromatic black hole horizon punctuated by gold stars and unstable debris.',
    difficulty: 'Expert',
    speedMultiplier: 1.15,
    obstacleFrequency: 1.25,
    bgColor: '#020205',
    starColor: '#ffd700',
    sunColorTop: '#ffffff',
    sunColorBottom: '#18181b',
    gridColor: '#ffd700',
    laneColor: '#ffffff',
    ambientColor: '#111111',
    dirLightColor: '#ffffff',
    pointLightColor: '#ffd700'
  }
];

