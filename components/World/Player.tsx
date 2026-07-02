/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH, GameStatus, CUSTOM_SKINS } from '../../types';
import { audio } from '../System/Audio';

// Physics Constants
const GRAVITY = 50;
const JUMP_FORCE = 16; // Results in ~2.56 height (v^2 / 2g)

// Refined Character Geometries
const HELMET_GEO = new THREE.SphereGeometry(0.2, 16, 16);
const VISOR_GEO = new THREE.CylinderGeometry(0.18, 0.18, 0.14, 16, 1, false, 0, Math.PI); // Half cylinder visor
const EAR_COMMS_GEO = new THREE.CylinderGeometry(0.04, 0.04, 0.28, 8); // Side antennae/comms
const CHEST_PLATE_GEO = new THREE.BoxGeometry(0.32, 0.45, 0.2); // Advanced torso core
const EMBLEM_GEO = new THREE.BoxGeometry(0.12, 0.18, 0.04); // Glowing central chest power core
const PAULDRON_GEO = new THREE.SphereGeometry(0.1, 8, 8); // Shoulder guard caps
const JETPACK_BODY_GEO = new THREE.BoxGeometry(0.22, 0.35, 0.12); // Jetpack pack
const THRUSTER_CYLINDER_GEO = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8); // Dual thrusters
const THRUSTER_NOZZLE_GEO = new THREE.CylinderGeometry(0.035, 0.02, 0.06, 8); // Nozzle cones
const THRUSTER_FLAME_GEO = new THREE.ConeGeometry(0.03, 0.15, 6); // Animated glowing plasma flame
const ARM_UPPER_GEO = new THREE.BoxGeometry(0.11, 0.35, 0.11); // Upper arm
const ARM_LOWER_GEO = new THREE.BoxGeometry(0.1, 0.35, 0.1);   // Lower arm
const JOINT_SPHERE_GEO = new THREE.SphereGeometry(0.06);
const HIPS_GEO = new THREE.CylinderGeometry(0.16, 0.16, 0.2);
const KNEEPAD_GEO = new THREE.BoxGeometry(0.11, 0.1, 0.05);     // Kneepad armor plate
const THIGH_GEO = new THREE.BoxGeometry(0.13, 0.4, 0.13);       // Thigh piece
const CALF_GEO = new THREE.BoxGeometry(0.11, 0.4, 0.11);        // Calf/Boot piece
const SHADOW_GEO = new THREE.CircleGeometry(0.5, 32);

export const Player: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  
  // Limb Refs for Animation
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftFlameRef = useRef<THREE.Mesh>(null);
  const rightFlameRef = useRef<THREE.Mesh>(null);

  const { 
    status, 
    laneCount, 
    takeDamage, 
    hasDoubleJump, 
    activateImmortality, 
    isImmortalityActive, 
    currentSkinId,
    isPowerupInvincible,
    isPowerupSpeedBoost
  } = useStore();
  
  const [lane, setLane] = React.useState(0);
  const targetX = useRef(0);
  
  // Physics State (using Refs for immediate logic updates)
  const isJumping = useRef(false);
  const velocityY = useRef(0);
  const jumpsPerformed = useRef(0); 
  const spinRotation = useRef(0); // For double jump flip
  
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const isInvincible = useRef(false);
  const lastDamageTime = useRef(0);

  const activeSkin = useMemo(() => {
      return CUSTOM_SKINS.find(s => s.id === currentSkinId) || CUSTOM_SKINS[0];
  }, [currentSkinId]);

  // Memoized Materials
  const { armorMaterial, jointMaterial, glowMaterial, shadowMaterial } = useMemo(() => {
      let armorColor = activeSkin.armorColor;
      let glowColor = activeSkin.glowColor;

      if (isImmortalityActive) {
          armorColor = '#ffd700';
          glowColor = '#ffffff';
      } else if (isPowerupInvincible) {
          armorColor = '#00ffff';
          glowColor = '#00ffff';
      } else if (isPowerupSpeedBoost) {
          armorColor = '#ffcc00';
          glowColor = '#ffaa00';
      }
      const jointColor = activeSkin.jointColor;
      
      return {
          armorMaterial: new THREE.MeshStandardMaterial({ color: armorColor, roughness: 0.3, metalness: 0.8 }),
          jointMaterial: new THREE.MeshStandardMaterial({ color: jointColor, roughness: 0.7, metalness: 0.5 }),
          glowMaterial: new THREE.MeshBasicMaterial({ color: glowColor }),
          shadowMaterial: new THREE.MeshBasicMaterial({ color: '#000000', opacity: 0.3, transparent: true })
      };
  }, [isImmortalityActive, isPowerupInvincible, isPowerupSpeedBoost, activeSkin]); // Only recreate if immortality or activeSkin or powerups change

  // --- Reset State on Game Start ---
  useEffect(() => {
      if (status === GameStatus.PLAYING) {
          isJumping.current = false;
          jumpsPerformed.current = 0;
          velocityY.current = 0;
          spinRotation.current = 0;
          if (groupRef.current) groupRef.current.position.y = 0;
          if (bodyRef.current) bodyRef.current.rotation.x = 0;
      }
  }, [status]);
  
  // Safety: Clamp lane if laneCount changes (e.g. restart)
  useEffect(() => {
      const maxLane = Math.floor(laneCount / 2);
      if (Math.abs(lane) > maxLane) {
          setLane(l => Math.max(Math.min(l, maxLane), -maxLane));
      }
  }, [laneCount, lane]);

  // --- Controls (Keyboard & Touch) ---
  const triggerJump = () => {
    const maxJumps = hasDoubleJump ? 3 : 2;

    if (!isJumping.current) {
        // First Jump
        audio.playJump(false);
        isJumping.current = true;
        jumpsPerformed.current = 1;
        velocityY.current = JUMP_FORCE;
        spinRotation.current = 0;
    } else if (jumpsPerformed.current < maxJumps) {
        // Double or Triple Jump (Mid-air)
        audio.playJump(true);
        jumpsPerformed.current += 1;
        velocityY.current = JUMP_FORCE; // Reset velocity upwards
    }
  };

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

  // --- Animation Loop ---
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (status !== GameStatus.PLAYING && status !== GameStatus.SHOP) return;

    // 1. Horizontal Position
    targetX.current = lane * LANE_WIDTH;
    groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x, 
        targetX.current, 
        delta * 15 
    );

    // 2. Physics (Jump)
    if (isJumping.current) {
        // Apply Velocity
        groupRef.current.position.y += velocityY.current * delta;
        // Apply Gravity
        velocityY.current -= GRAVITY * delta;

        // Floor Collision
        if (groupRef.current.position.y <= 0) {
            groupRef.current.position.y = 0;
            isJumping.current = false;
            jumpsPerformed.current = 0;
            velocityY.current = 0;
            // Reset flip
            if (bodyRef.current) bodyRef.current.rotation.x = 0;
        }

        // Multi-Jump Flip Animation
        if (jumpsPerformed.current >= 2 && bodyRef.current) {
             // Rotate quickly per extra jump
             const targetSpin = -Math.PI * 2 * (jumpsPerformed.current - 1);
             spinRotation.current -= delta * 18;
             if (spinRotation.current < targetSpin) {
                 spinRotation.current = targetSpin;
             }
             bodyRef.current.rotation.x = spinRotation.current;
        }
    }

    // Banking Rotation
    const xDiff = targetX.current - groupRef.current.position.x;
    groupRef.current.rotation.z = -xDiff * 0.2; 
    groupRef.current.rotation.x = isJumping.current ? 0.1 : 0.05; 

    // 3. Skeletal Animation
    const time = state.clock.elapsedTime * 25; 
    
    if (!isJumping.current) {
        // Running Cycle
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time) * 0.7;
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time + Math.PI) * 0.7;
        if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time + Math.PI) * 1.0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time) * 1.0;
        
        if (bodyRef.current) bodyRef.current.position.y = 1.1 + Math.abs(Math.sin(time)) * 0.1;
    } else {
        // Jumping Pose
        const jumpPoseSpeed = delta * 10;
        if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -2.5, jumpPoseSpeed);
        if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.5, jumpPoseSpeed);
        if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0.5, jumpPoseSpeed);
        if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.5, jumpPoseSpeed);
        
        // Only reset Y if not flipping (handled by flip logic mostly, but safe here)
        if (bodyRef.current && jumpsPerformed.current !== 2) bodyRef.current.position.y = 1.1; 
    }

    // 4. Dynamic Shadow
    if (shadowRef.current) {
        const height = groupRef.current.position.y;
        const scale = Math.max(0.2, 1 - (height / 2.5) * 0.5); // 2.5 is max jump height approx
        const runStretch = isJumping.current ? 1 : 1 + Math.abs(Math.sin(time)) * 0.3;

        shadowRef.current.scale.set(scale, scale, scale * runStretch);
        const material = shadowRef.current.material as THREE.MeshBasicMaterial;
        if (material && !Array.isArray(material)) {
            material.opacity = Math.max(0.1, 0.3 - (height / 2.5) * 0.2);
        }
    }

    // 5. Thruster Flame Flicker Animation
    const flameYScale = 0.7 + Math.random() * 0.6;
    if (leftFlameRef.current) {
        leftFlameRef.current.scale.set(1, flameYScale, 1);
        leftFlameRef.current.position.y = -0.04 - (flameYScale * 0.075);
    }
    if (rightFlameRef.current) {
        rightFlameRef.current.scale.set(1, flameYScale, 1);
        rightFlameRef.current.position.y = -0.04 - (flameYScale * 0.075);
    }

    // Invincibility / Immortality Effect
    const showFlicker = isInvincible.current || isImmortalityActive || isPowerupInvincible;
    if (showFlicker) {
        if (isInvincible.current) {
             if (Date.now() - lastDamageTime.current > 1500) {
                isInvincible.current = false;
                groupRef.current.visible = true;
             } else {
                groupRef.current.visible = Math.floor(Date.now() / 50) % 2 === 0;
             }
        } 
        if (isImmortalityActive || isPowerupInvincible) {
            groupRef.current.visible = true; 
        }
    } else {
        groupRef.current.visible = true;
    }
  });

  // Damage Handler
  useEffect(() => {
     const checkHit = (e: any) => {
        if (isInvincible.current || isImmortalityActive || isPowerupInvincible) return;
        audio.playDamage(); // Play damage sound
        takeDamage();
        isInvincible.current = true;
        lastDamageTime.current = Date.now();
     };
     window.addEventListener('player-hit', checkHit);
     return () => window.removeEventListener('player-hit', checkHit);
  }, [takeDamage, isImmortalityActive, isPowerupInvincible]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {isPowerupInvincible && (
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.85, 16, 16]} />
          <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.25} />
        </mesh>
      )}
      <group ref={bodyRef} position={[0, 1.1, 0]}> 
        
        {/* Chest / Torso Core */}
        <mesh castShadow position={[0, 0.15, 0]} geometry={CHEST_PLATE_GEO} material={armorMaterial} />

        {/* Glowing Chest Emblem Core */}
        <mesh position={[0, 0.2, 0.11]} geometry={EMBLEM_GEO} material={glowMaterial} />

        {/* Shoulder Pauldrons */}
        <mesh position={[0.22, 0.32, 0]} geometry={PAULDRON_GEO} material={armorMaterial} />
        <mesh position={[-0.22, 0.32, 0]} geometry={PAULDRON_GEO} material={armorMaterial} />

        {/* Advanced Jetpack */}
        <mesh position={[0, 0.15, -0.15]} geometry={JETPACK_BODY_GEO} material={jointMaterial} />
        
        {/* Left Jetpack Thruster and Flame */}
        <group position={[-0.1, 0.15, -0.18]}>
            <mesh geometry={THRUSTER_CYLINDER_GEO} material={armorMaterial} />
            <mesh position={[0, -0.18, 0]} geometry={THRUSTER_NOZZLE_GEO} material={jointMaterial} />
            <mesh ref={leftFlameRef} position={[0, -0.26, 0]} rotation={[Math.PI, 0, 0]} geometry={THRUSTER_FLAME_GEO} material={glowMaterial} />
        </group>

        {/* Right Jetpack Thruster and Flame */}
        <group position={[0.1, 0.15, -0.18]}>
            <mesh geometry={THRUSTER_CYLINDER_GEO} material={armorMaterial} />
            <mesh position={[0, -0.18, 0]} geometry={THRUSTER_NOZZLE_GEO} material={jointMaterial} />
            <mesh ref={rightFlameRef} position={[0, -0.26, 0]} rotation={[Math.PI, 0, 0]} geometry={THRUSTER_FLAME_GEO} material={glowMaterial} />
        </group>

        {/* Helmet / Head with Visor and Antennae */}
        <group ref={headRef} position={[0, 0.55, 0]}>
            <mesh castShadow geometry={HELMET_GEO} material={armorMaterial} />
            <mesh position={[0, 0, 0.08]} rotation={[0, Math.PI / 2, 0]} geometry={VISOR_GEO} material={glowMaterial} />
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={EAR_COMMS_GEO} material={jointMaterial} />
        </group>

        {/* Right Arm (Segmented with shoulder armor) */}
        <group position={[0.26, 0.32, 0]}>
            <group ref={rightArmRef}>
                <mesh position={[0, -0.12, 0]} castShadow geometry={ARM_UPPER_GEO} material={armorMaterial} />
                <mesh position={[0, -0.26, 0]} geometry={JOINT_SPHERE_GEO} material={jointMaterial} />
                <mesh position={[0, -0.4, 0]} castShadow geometry={ARM_LOWER_GEO} material={armorMaterial} />
                <mesh position={[0, -0.55, 0]} geometry={JOINT_SPHERE_GEO} material={glowMaterial} />
            </group>
        </group>

        {/* Left Arm (Segmented with shoulder armor) */}
        <group position={[-0.26, 0.32, 0]}>
            <group ref={leftArmRef}>
                 <mesh position={[0, -0.12, 0]} castShadow geometry={ARM_UPPER_GEO} material={armorMaterial} />
                 <mesh position={[0, -0.26, 0]} geometry={JOINT_SPHERE_GEO} material={jointMaterial} />
                 <mesh position={[0, -0.4, 0]} castShadow geometry={ARM_LOWER_GEO} material={armorMaterial} />
                 <mesh position={[0, -0.55, 0]} geometry={JOINT_SPHERE_GEO} material={glowMaterial} />
            </group>
        </group>

        {/* Hips */}
        <mesh position={[0, -0.15, 0]} geometry={HIPS_GEO} material={jointMaterial} />

        {/* Right Leg (Detailed with kneepad and boots) */}
        <group position={[0.12, -0.15, 0]}>
            <group ref={rightLegRef}>
                 <mesh position={[0, -0.15, 0]} castShadow geometry={THIGH_GEO} material={armorMaterial} />
                 <mesh position={[0, -0.32, 0]} geometry={JOINT_SPHERE_GEO} material={jointMaterial} />
                 <mesh position={[0, -0.32, 0.06]} geometry={KNEEPAD_GEO} material={glowMaterial} />
                 <mesh position={[0, -0.5, 0]} castShadow geometry={CALF_GEO} material={armorMaterial} />
            </group>
        </group>

        {/* Left Leg (Detailed with kneepad and boots) */}
        <group position={[-0.12, -0.15, 0]}>
            <group ref={leftLegRef}>
                 <mesh position={[0, -0.15, 0]} castShadow geometry={THIGH_GEO} material={armorMaterial} />
                 <mesh position={[0, -0.32, 0]} geometry={JOINT_SPHERE_GEO} material={jointMaterial} />
                 <mesh position={[0, -0.32, 0.06]} geometry={KNEEPAD_GEO} material={glowMaterial} />
                 <mesh position={[0, -0.5, 0]} castShadow geometry={CALF_GEO} material={armorMaterial} />
            </group>
        </group>
      </group>
      
      <mesh ref={shadowRef} position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]} geometry={SHADOW_GEO} material={shadowMaterial} />
    </group>
  );
};