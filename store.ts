/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE, CUSTOM_MAPS, LEVEL_KEYWORDS } from './types';

interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  maxLives: number;
  speed: number;
  collectedLetters: number[]; 
  level: number;
  laneCount: number;
  gemsCollected: number;
  distance: number;
  currentMapId: string;
  currentSkinId: string;
  
  // Inventory / Abilities
  hasDoubleJump: boolean;
  hasImmortality: boolean;
  isImmortalityActive: boolean;

  // Actions
  selectMap: (mapId: string) => void;
  selectSkin: (skinId: string) => void;
  startGame: () => void;
  restartGame: () => void;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  collectGem: (value: number) => void;
  collectLetter: (index: number) => void;
  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;
  
  // Shop / Abilities
  buyItem: (type: 'DOUBLE_JUMP' | 'MAX_LIFE' | 'HEAL' | 'IMMORTAL', cost: number) => boolean;
  advanceLevel: () => void;
  openShop: () => void;
  closeShop: () => void;
  activateImmortality: () => void;
}

const MAX_LEVEL = 5;

export const useStore = create<GameState>((set, get) => ({
  status: GameStatus.MENU,
  score: 0,
  lives: 3,
  maxLives: 3,
  speed: 0,
  collectedLetters: [],
  level: 1,
  laneCount: 3,
  gemsCollected: 0,
  distance: 0,
  currentMapId: 'andromeda',
  currentSkinId: 'cyber_cyan',
  
  hasDoubleJump: false,
  hasImmortality: false,
  isImmortalityActive: false,

  selectMap: (mapId: string) => set({ currentMapId: mapId }),
  selectSkin: (skinId: string) => set({ currentSkinId: skinId }),

  startGame: () => {
    const { currentMapId } = get();
    const map = CUSTOM_MAPS.find(m => m.id === currentMapId) || CUSTOM_MAPS[0];
    set({ 
      status: GameStatus.PLAYING, 
      score: 0, 
      lives: 3, 
      maxLives: 3,
      speed: RUN_SPEED_BASE * map.speedMultiplier,
      collectedLetters: [],
      level: 1,
      laneCount: 3,
      gemsCollected: 0,
      distance: 0,
      hasDoubleJump: false,
      hasImmortality: false,
      isImmortalityActive: false
    });
  },

  restartGame: () => {
    const { currentMapId } = get();
    const map = CUSTOM_MAPS.find(m => m.id === currentMapId) || CUSTOM_MAPS[0];
    set({ 
      status: GameStatus.PLAYING, 
      score: 0, 
      lives: 3, 
      maxLives: 3,
      speed: RUN_SPEED_BASE * map.speedMultiplier,
      collectedLetters: [],
      level: 1,
      laneCount: 3,
      gemsCollected: 0,
      distance: 0,
      hasDoubleJump: false,
      hasImmortality: false,
      isImmortalityActive: false
    });
  },

  takeDamage: () => {
    const { lives, isImmortalityActive } = get();
    if (isImmortalityActive) return; // No damage if skill is active

    if (lives > 1) {
      set({ lives: lives - 1 });
    } else {
      set({ lives: 0, status: GameStatus.GAME_OVER, speed: 0 });
    }
  },

  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  
  collectGem: (value) => set((state) => ({ 
    score: state.score + value, 
    gemsCollected: state.gemsCollected + 1 
  })),

  setDistance: (dist) => set({ distance: dist }),

  collectLetter: (index) => {
    const { collectedLetters, level, speed, currentMapId } = get();
    const currentKeyword = LEVEL_KEYWORDS[(level - 1) % LEVEL_KEYWORDS.length];
    
    if (!collectedLetters.includes(index)) {
      const newLetters = [...collectedLetters, index];
      const map = CUSTOM_MAPS.find(m => m.id === currentMapId) || CUSTOM_MAPS[0];
      
      // LINEAR SPEED INCREASE: Add 10% of BASE speed (scaled by map multiplier) per letter
      const speedIncrease = RUN_SPEED_BASE * map.speedMultiplier * 0.10;
      const nextSpeed = speed + speedIncrease;

      set({ 
        collectedLetters: newLetters,
        speed: nextSpeed
      });

      // Check if full word collected
      if (newLetters.length === currentKeyword.length) {
        if (level < MAX_LEVEL) {
            // Immediately advance level
            get().advanceLevel();
        } else {
            // Victory Condition
            set({
                status: GameStatus.VICTORY,
                score: get().score + 5000
            });
        }
      }
    }
  },

  advanceLevel: () => {
      const { level, laneCount, speed, currentMapId } = get();
      const nextLevel = level + 1;
      const map = CUSTOM_MAPS.find(m => m.id === currentMapId) || CUSTOM_MAPS[0];
      
      // LINEAR LEVEL INCREASE: Add 40% of BASE speed (scaled by map multiplier) per level
      const speedIncrease = RUN_SPEED_BASE * map.speedMultiplier * 0.40;
      const newSpeed = speed + speedIncrease;

      set({
          level: nextLevel,
          laneCount: Math.min(laneCount + 2, 9), // Expand lanes
          status: GameStatus.PLAYING, // Keep playing, user runs into shop
          speed: newSpeed,
          collectedLetters: [] // Reset letters
      });
  },

  openShop: () => set({ status: GameStatus.SHOP }),
  
  closeShop: () => set({ status: GameStatus.PLAYING }),

  buyItem: (type, cost) => {
      const { score, maxLives, lives } = get();
      
      if (score >= cost) {
          set({ score: score - cost });
          
          switch (type) {
              case 'DOUBLE_JUMP':
                  set({ hasDoubleJump: true });
                  break;
              case 'MAX_LIFE':
                  set({ maxLives: maxLives + 1, lives: lives + 1 });
                  break;
              case 'HEAL':
                  set({ lives: Math.min(lives + 1, maxLives) });
                  break;
              case 'IMMORTAL':
                  set({ hasImmortality: true });
                  break;
          }
          return true;
      }
      return false;
  },

  activateImmortality: () => {
      const { hasImmortality, isImmortalityActive } = get();
      if (hasImmortality && !isImmortalityActive) {
          set({ isImmortalityActive: true });
          
          // Lasts 5 seconds
          setTimeout(() => {
              set({ isImmortalityActive: false });
          }, 5000);
      }
  },

  setStatus: (status) => set({ status }),
  increaseLevel: () => set((state) => ({ level: state.level + 1 })),
}));
