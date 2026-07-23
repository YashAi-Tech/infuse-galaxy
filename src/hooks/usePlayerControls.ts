import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { GameStatus } from '../types';
import { audio } from '../../components/System/Audio';

const JUMP_FORCE = 16;

/**
 * Custom hook to handle player inputs (keyboard and touch).
 * Extracts event listeners out of the main Player component.
 */
export function usePlayerControls() {
  const { 
    status, 
    laneCount, 
    hasDoubleJump, 
    activateImmortality 
  } = useStore();
  
  const [lane, setLane] = useState(0);
  const isJumping = useRef(false);
  const velocityY = useRef(0);
  const jumpsPerformed = useRef(0); 
  const spinRotation = useRef(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Safety: Clamp lane if laneCount changes
  useEffect(() => {
      const maxLane = Math.floor(laneCount / 2);
      if (Math.abs(lane) > maxLane) {
          setLane(l => Math.max(Math.min(l, maxLane), -maxLane));
      }
  }, [laneCount, lane]);

  const triggerJump = () => {
    const maxJumps = hasDoubleJump ? 3 : 2;

    if (!isJumping.current) {
        audio.playJump(false);
        isJumping.current = true;
        jumpsPerformed.current = 1;
        velocityY.current = JUMP_FORCE;
        spinRotation.current = 0;
    } else if (jumpsPerformed.current < maxJumps) {
        audio.playJump(true);
        jumpsPerformed.current += 1;
        velocityY.current = JUMP_FORCE;
    }
  };

  // --- Keyboard Controls ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      const maxLane = Math.floor(laneCount / 2);

      if (e.key === 'ArrowLeft') setLane(l => Math.max(l - 1, -maxLane));
      else if (e.key === 'ArrowRight') setLane(l => Math.min(l + 1, maxLane));
      else if (e.key === 'ArrowUp' || e.key === 'w') triggerJump();
      else if (e.key === ' ' || e.key === 'Enter') {
          activateImmortality();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, laneCount, hasDoubleJump, activateImmortality]);

  // --- Touch Controls ---
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (status !== GameStatus.PLAYING) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        const deltaY = e.changedTouches[0].clientY - touchStartY.current;
        const maxLane = Math.floor(laneCount / 2);

        // Swipe Detection
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
             if (deltaX > 0) setLane(l => Math.min(l + 1, maxLane));
             else setLane(l => Math.max(l - 1, -maxLane));
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < -30) {
            triggerJump();
        } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
            activateImmortality();
        }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [status, laneCount, hasDoubleJump, activateImmortality]);

  return { lane, setLane, isJumping, velocityY, jumpsPerformed, spinRotation };
}
