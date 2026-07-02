/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { Heart, Zap, Trophy, MapPin, Diamond, Rocket, ArrowUpCircle, Shield, Activity, PlusCircle, Play } from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, GALAXY_COLORS, ShopItem, RUN_SPEED_BASE, CUSTOM_MAPS, MapData, CUSTOM_SKINS, LEVEL_KEYWORDS, getNeonColorForIndex } from '../../types';
import { audio } from '../System/Audio';

// Available Shop Items
const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'DOUBLE_JUMP',
        name: 'DOUBLE JUMP',
        description: 'Jump again in mid-air. Essential for high obstacles.',
        cost: 1000,
        icon: ArrowUpCircle,
        oneTime: true
    },
    {
        id: 'MAX_LIFE',
        name: 'MAX LIFE UP',
        description: 'Permanently adds a heart slot and heals you.',
        cost: 1500,
        icon: Activity
    },
    {
        id: 'HEAL',
        name: 'REPAIR KIT',
        description: 'Restores 1 Life point instantly.',
        cost: 1000,
        icon: PlusCircle
    },
    {
        id: 'IMMORTAL',
        name: 'IMMORTALITY',
        description: 'Unlock Ability: Press Space/Tap to be invincible for 5s.',
        cost: 3000,
        icon: Shield,
        oneTime: true
    }
];

const ShopScreen: React.FC = () => {
    const { score, buyItem, closeShop, hasDoubleJump, hasImmortality } = useStore();
    const [items, setItems] = useState<ShopItem[]>([]);

    useEffect(() => {
        // Select 3 random items, filtering out one-time items already bought
        let pool = SHOP_ITEMS.filter(item => {
            if (item.id === 'DOUBLE_JUMP' && hasDoubleJump) return false;
            if (item.id === 'IMMORTAL' && hasImmortality) return false;
            return true;
        });

        // Shuffle and pick 3
        pool = pool.sort(() => 0.5 - Math.random());
        setItems(pool.slice(0, 3));
    }, []);

    return (
        <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
             <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                 <h2 className="text-3xl md:text-4xl font-black text-cyan-400 mb-2 font-cyber tracking-widest text-center">CYBER SHOP</h2>
                 <div className="flex items-center text-yellow-400 mb-6 md:mb-8">
                     <span className="text-base md:text-lg mr-2">AVAILABLE CREDITS:</span>
                     <span className="text-xl md:text-2xl font-bold">{score.toLocaleString()}</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full mb-8">
                     {items.map(item => {
                         const Icon = item.icon;
                         const canAfford = score >= item.cost;
                         return (
                             <div key={item.id} className="bg-gray-900/80 border border-gray-700 p-4 md:p-6 rounded-xl flex flex-col items-center text-center hover:border-cyan-500 transition-colors">
                                 <div className="bg-gray-800 p-3 md:p-4 rounded-full mb-3 md:mb-4">
                                     <Icon className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                                 </div>
                                 <h3 className="text-lg md:text-xl font-bold mb-2">{item.name}</h3>
                                 <p className="text-gray-400 text-xs md:text-sm mb-4 h-10 md:h-12 flex items-center justify-center">{item.description}</p>
                                 <button 
                                    onClick={() => buyItem(item.id as any, item.cost)}
                                    disabled={!canAfford}
                                    className={`px-4 md:px-6 py-2 rounded font-bold w-full text-sm md:text-base ${canAfford ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110' : 'bg-gray-700 cursor-not-allowed opacity-50'}`}
                                 >
                                     {item.cost} GEMS
                                 </button>
                             </div>
                         );
                     })}
                 </div>

                 <button 
                    onClick={closeShop}
                    className="flex items-center px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,0,255,0.4)]"
                 >
                     RESUME MISSION <Play className="ml-2 w-5 h-5" fill="white" />
                 </button>
             </div>
        </div>
    );
};

export const HUD: React.FC = () => {
  const { 
    score, 
    lives, 
    maxLives, 
    collectedLetters, 
    status, 
    level, 
    restartGame, 
    startGame, 
    gemsCollected, 
    distance, 
    isImmortalityActive, 
    speed, 
    currentMapId, 
    selectMap, 
    currentSkinId, 
    selectSkin,
    isPowerupInvincible,
    powerupInvincibleTimeLeft,
    isPowerupSpeedBoost,
    powerupSpeedBoostTimeLeft
  } = useStore();
  const target = LEVEL_KEYWORDS[(level - 1) % LEVEL_KEYWORDS.length];

  // Common container style
  const containerClass = "absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-50";

  if (status === GameStatus.SHOP) {
      return <ShopScreen />;
  }

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-[#03010a]/90 backdrop-blur-md p-4 pointer-events-auto overflow-y-auto">
              {/* Card Container - expanded size for side-by-side or beautiful grid layout */}
              <div className="relative w-full max-w-2xl bg-gray-950/85 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,255,255,0.15)] border border-white/10 animate-in zoom-in-95 duration-500 flex flex-col items-center">
                
                {/* Header Section */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 font-cyber tracking-widest drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                        INFUSE GALAXY RUN
                    </h1>
                    <p className="text-gray-400 text-xs md:text-sm mt-2 max-w-md font-sans leading-relaxed">
                        Swerve lanes, collect GALAXY letters, and navigate high-speed cosmic channels in this ultimate synthwave racer.
                    </p>
                </div>

                {/* Subtitle */}
                <div className="w-full text-left mb-3">
                    <h2 className="text-cyan-400 font-bold font-cyber text-xs uppercase tracking-wider">
                        Select Coordinates (Custom Maps)
                    </h2>
                </div>

                {/* Grid of Custom Maps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-6">
                    {CUSTOM_MAPS.map(map => {
                        const isSelected = map.id === currentMapId;
                        
                        // Dynamic difficulty styles
                        let diffColor = 'text-green-400 border-green-500/30 bg-green-500/10';
                        if (map.difficulty === 'Hard') diffColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
                        if (map.difficulty === 'Challenging') diffColor = 'text-orange-400 border-orange-500/30 bg-orange-500/10';
                        if (map.difficulty === 'Expert') diffColor = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
                        
                        return (
                            <button
                                key={map.id}
                                onClick={() => { audio.init(); selectMap(map.id); }}
                                style={isSelected ? { borderColor: map.laneColor, boxShadow: `0 0 20px ${map.laneColor}44` } : {}}
                                className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 pointer-events-auto cursor-pointer ${
                                    isSelected 
                                    ? 'bg-white/5 border-white/40 scale-[1.02]' 
                                    : 'bg-black/50 border-white/5 hover:border-white/15'
                                }`}
                            >
                                <div className="flex justify-between items-center w-full mb-2">
                                    <span 
                                        className="font-cyber font-bold text-sm md:text-base tracking-wider" 
                                        style={{ color: isSelected ? map.laneColor : '#e2e8f0' }}
                                    >
                                        {map.name}
                                    </span>
                                    <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full border font-mono tracking-wider font-bold ${diffColor}`}>
                                        {map.difficulty}
                                    </span>
                                </div>
                                
                                <p className="text-[11px] text-gray-400 leading-relaxed mb-3 h-8 line-clamp-2">
                                    {map.description}
                                </p>

                                {/* Map-specific Stats bar */}
                                <div className="flex items-center space-x-4 mt-auto text-[10px] font-mono text-gray-400">
                                    <div className="flex items-center space-x-1.5">
                                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                                        <span>Speed: x{map.speedMultiplier.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <Activity className="w-3.5 h-3.5 text-pink-500" />
                                        <span>Spikes: x{map.obstacleFrequency.toFixed(2)}</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Subtitle for Skin Selection */}
                <div className="w-full text-left mb-3">
                    <h2 className="text-cyan-400 font-bold font-cyber text-xs uppercase tracking-wider">
                        Customize Spacesuit (Visual Presets)
                    </h2>
                </div>

                {/* Grid of Custom Skins */}
                <div className="grid grid-cols-2 gap-3 w-full mb-6">
                    {CUSTOM_SKINS.map(skin => {
                        const isSelected = skin.id === currentSkinId;
                        return (
                            <button
                                key={skin.id}
                                onClick={() => { selectSkin(skin.id); }}
                                style={isSelected ? { borderColor: skin.armorColor, boxShadow: `0 0 15px ${skin.armorColor}44` } : {}}
                                className={`flex items-center space-x-3 text-left p-3 rounded-xl border transition-all duration-300 pointer-events-auto cursor-pointer ${
                                    isSelected 
                                    ? 'bg-white/5 border-white/40 scale-[1.02]' 
                                    : 'bg-black/50 border-white/5 hover:border-white/15'
                                }`}
                            >
                                {/* Color dot indicator representing armor and glow */}
                                <div className="relative flex-shrink-0 w-8 h-8 rounded-full border border-white/10 overflow-hidden flex items-center justify-center" style={{ backgroundColor: skin.jointColor }}>
                                    <div className="absolute inset-0 rounded-full scale-[0.6]" style={{ backgroundColor: skin.armorColor }} />
                                    <div className="absolute w-2.5 h-2.5 rounded-full scale-[0.3]" style={{ backgroundColor: skin.glowColor }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-cyber font-bold text-xs tracking-wide truncate" style={{ color: isSelected ? skin.armorColor : '#e2e8f0' }}>
                                        {skin.name}
                                    </p>
                                    <p className="text-[9px] text-gray-400 truncate max-w-full">
                                        {skin.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Launch Button Section */}
                <div className="w-full text-center mt-2">
                    <button 
                        onClick={() => { audio.init(); startGame(); }}
                        className="w-full group relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-xl rounded-2xl hover:bg-white/20 transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(0,255,255,0.4)] hover:border-cyan-400 overflow-hidden cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/40 via-purple-500/40 to-cyan-500/40 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <span className="relative z-10 tracking-widest flex items-center justify-center font-cyber">
                            INITIALIZE RUN <Play className="ml-3 w-5 h-5 fill-white" />
                        </span>
                    </button>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 text-[11px] text-gray-400 font-mono tracking-wider uppercase">
                        <span>[ ARROWS / SWIPE TO MOVE ]</span>
                        <span className="hidden sm:inline text-gray-600">|</span>
                        <span>[ SPACEBAR / TAP FOR IMMORTALITY ]</span>
                    </div>
                </div>

              </div>
          </div>
      );
  }

  if (status === GameStatus.GAME_OVER) {
      return (
          <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-sm overflow-y-auto">
              <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] font-cyber text-center">GAME OVER</h1>
                
                <div className="grid grid-cols-1 gap-3 md:gap-4 text-center mb-8 w-full max-w-md">
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-yellow-400 text-sm md:text-base"><Trophy className="mr-2 w-4 h-4 md:w-5 md:h-5"/> LEVEL</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{level} / 3</div>
                    </div>
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-cyan-400 text-sm md:text-base"><Diamond className="mr-2 w-4 h-4 md:w-5 md:h-5"/> GEMS COLLECTED</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{gemsCollected}</div>
                    </div>
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-purple-400 text-sm md:text-base"><MapPin className="mr-2 w-4 h-4 md:w-5 md:h-5"/> DISTANCE</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{Math.floor(distance)} LY</div>
                    </div>
                     <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg flex items-center justify-between mt-2">
                        <div className="flex items-center text-white text-sm md:text-base">TOTAL SCORE</div>
                        <div className="text-2xl md:text-3xl font-bold font-cyber text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{score.toLocaleString()}</div>
                    </div>
                </div>

                <button 
                  onClick={() => { audio.init(); restartGame(); }}
                  className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                >
                    RUN AGAIN
                </button>
              </div>
          </div>
      );
  }

  if (status === GameStatus.VICTORY) {
    return (
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/90 to-black/95 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
            <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <Rocket className="w-16 h-16 md:w-24 md:h-24 text-yellow-400 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
                <h1 className="text-3xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-500 to-pink-500 mb-2 drop-shadow-[0_0_20px_rgba(255,165,0,0.6)] font-cyber text-center leading-tight">
                    MISSION COMPLETE
                </h1>
                <p className="text-cyan-300 text-sm md:text-2xl font-mono mb-8 tracking-widest text-center">
                    THE ANSWER TO THE UNIVERSE HAS BEEN FOUND
                </p>
                
                <div className="grid grid-cols-1 gap-4 text-center mb-8 w-full max-w-md">
                    <div className="bg-black/60 p-6 rounded-xl border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
                        <div className="text-xs md:text-sm text-gray-400 mb-1 tracking-wider">FINAL SCORE</div>
                        <div className="text-3xl md:text-4xl font-bold font-cyber text-yellow-400">{score.toLocaleString()}</div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                            <div className="text-xs text-gray-400">GEMS</div>
                            <div className="text-xl md:text-2xl font-bold text-cyan-400">{gemsCollected}</div>
                        </div>
                        <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                             <div className="text-xs text-gray-400">DISTANCE</div>
                            <div className="text-xl md:text-2xl font-bold text-purple-400">{Math.floor(distance)} LY</div>
                        </div>
                     </div>
                </div>

                <button 
                  onClick={() => { audio.init(); restartGame(); }}
                  className="px-8 md:px-12 py-4 md:py-5 bg-white text-black font-black text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] tracking-widest"
                >
                    RESTART MISSION
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className={containerClass}>
        {/* Top Bar */}
        <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
                <div className="text-3xl md:text-5xl font-bold text-cyan-400 drop-shadow-[0_0_10px_#00ffff] font-cyber">
                    {score.toLocaleString()}
                </div>
            </div>
            
            <div className="flex space-x-1 md:space-x-2">
                {[...Array(maxLives)].map((_, i) => (
                    <Heart 
                        key={i} 
                        className={`w-6 h-6 md:w-8 md:h-8 ${i < lives ? 'text-pink-500 fill-pink-500' : 'text-gray-800 fill-gray-800'} drop-shadow-[0_0_5px_#ff0054]`} 
                    />
                ))}
            </div>
        </div>
        
        {/* Level Indicator - Moved to Top Center aligned with Score/Hearts */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-sm md:text-lg text-purple-300 font-bold tracking-wider font-mono bg-black/50 px-3 py-1 rounded-full border border-purple-500/30 backdrop-blur-sm z-50">
            LEVEL {level} <span className="text-gray-500 text-xs md:text-sm">/ 5</span>
        </div>

        {/* Active Skill & Powerup Indicators */}
        <div className="absolute top-24 md:top-32 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 pointer-events-none z-50">
            {isImmortalityActive && (
                 <div className="text-yellow-400 font-bold text-lg md:text-xl animate-pulse flex items-center drop-shadow-[0_0_10px_gold]">
                     <Shield className="mr-2 fill-yellow-400 w-5 h-5" /> IMMORTAL
                 </div>
            )}
            {isPowerupInvincible && (
                 <div className="text-cyan-400 font-bold text-lg md:text-xl animate-pulse flex items-center drop-shadow-[0_0_10px_#00ffff]">
                     <Shield className="mr-2 fill-cyan-400 w-5 h-5" /> SHIELD ACTIVE ({Math.ceil(powerupInvincibleTimeLeft)}s)
                 </div>
            )}
            {isPowerupSpeedBoost && (
                 <div className="text-yellow-500 font-bold text-lg md:text-xl animate-pulse flex items-center drop-shadow-[0_0_10px_#eab308]">
                     <Zap className="mr-2 fill-yellow-500 w-5 h-5" /> HYPERDRIVE ({Math.ceil(powerupSpeedBoostTimeLeft)}s)
                 </div>
            )}
        </div>

        {/* Galaxy Collection Status - Just below Top Bar */}
        <div className="absolute top-16 md:top-24 left-1/2 transform -translate-x-1/2 flex space-x-2 md:space-x-3">
            {target.map((char, idx) => {
                const isCollected = collectedLetters.includes(idx);
                const color = getNeonColorForIndex(idx);

                return (
                    <div 
                        key={idx}
                        style={{
                            borderColor: isCollected ? color : 'rgba(55, 65, 81, 1)',
                            // Use dark text (almost black) when collected to contrast with neon background
                            color: isCollected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(55, 65, 81, 1)',
                            boxShadow: isCollected ? `0 0 20px ${color}` : 'none',
                            backgroundColor: isCollected ? color : 'rgba(0, 0, 0, 0.9)'
                        }}
                        className={`w-8 h-10 md:w-10 md:h-12 flex items-center justify-center border-2 font-black text-lg md:text-xl font-cyber rounded-lg transform transition-all duration-300`}
                    >
                        {char}
                    </div>
                );
            })}
        </div>

        {/* Bottom Overlay */}
        <div className="w-full flex justify-end items-end">
             <div className="flex items-center space-x-2 text-cyan-500 opacity-70">
                 <Zap className="w-4 h-4 md:w-6 md:h-6 animate-pulse" />
                 <span className="font-mono text-base md:text-xl">SPEED {Math.round((speed / RUN_SPEED_BASE) * 100)}%</span>
             </div>
        </div>
    </div>
  );
};
