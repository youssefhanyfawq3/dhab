'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stone } from './stone';
import { Lights } from './lights';
import { useMousePosition } from '@/hooks/use-mouse-position';
import { useScrollProgress } from '@/hooks/use-scroll-progress';
import * as THREE from 'three';

interface GoldStonesSceneProps {
  isMobile?: boolean;
  blurIntensity?: number;
}

export function GoldStonesScene({ isMobile = false, blurIntensity = 0 }: GoldStonesSceneProps) {
  const { camera } = useThree();
  const mousePosition = useMousePosition();
  const scrollProgress = useScrollProgress();

  // Memoize mouse position for performance
  const memoizedMousePosition = useMemo(() => ({
    normalizedX: mousePosition.normalizedX,
    normalizedY: mousePosition.normalizedY,
  }), [mousePosition.normalizedX, mousePosition.normalizedY]);

  // Camera zoom and depth effect based on scroll
  useFrame(() => {
    if (!isMobile) {
      const targetZ = 10 - scrollProgress.progress * 2 + blurIntensity * 3;
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.02);

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, 50 + blurIntensity * 15, 0.01);
        camera.updateProjectionMatrix();
      }
    } else {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, 60 + blurIntensity * 10, 0.01);
        camera.updateProjectionMatrix();
      }
    }
  });

  // Stone configurations — 3 stones for visual depth
  const stone1Config = useMemo(() => ({
    position: [-4.5, 0.5, -2] as [number, number, number],
    scale: isMobile ? 1.5 : 2.2,
    mouseStrength: 0.25,
  }), [isMobile]);

  const stone2Config = useMemo(() => ({
    position: [4.5, -0.5, 1] as [number, number, number],
    scale: isMobile ? 0.8 : 1.3,
    mouseStrength: 0.4,
  }), [isMobile]);

  // New third stone — medium, center-back
  const stone3Config = useMemo(() => ({
    position: [0.5, -1.5, -4] as [number, number, number],
    scale: isMobile ? 1.0 : 1.6,
    mouseStrength: 0.15,
  }), [isMobile]);

  return (
    <>
      {/* Lighting setup */}
      <Lights mousePosition={memoizedMousePosition} />

      {/* Fallback lighting */}
      <hemisphereLight
        color="#FFD700"
        groundColor="#1a1a2e"
        intensity={0.2}
      />

      {/* Stone 1 - Large Rock (Background) */}
      <Stone
        position={stone1Config.position}
        scale={stone1Config.scale}
        type="rock"
        mousePosition={memoizedMousePosition}
        scrollProgress={scrollProgress.progress}
        mouseStrength={stone1Config.mouseStrength}
        isMobile={isMobile}
        blurIntensity={blurIntensity}
      />

      {/* Stone 2 - Crystal (Foreground) */}
      <Stone
        position={stone2Config.position}
        scale={stone2Config.scale}
        type="crystal"
        mousePosition={memoizedMousePosition}
        scrollProgress={scrollProgress.progress}
        mouseStrength={stone2Config.mouseStrength}
        isMobile={isMobile}
        blurIntensity={blurIntensity}
      />

      {/* Stone 3 - Medium Rock (Center-back depth) */}
      <Stone
        position={stone3Config.position}
        scale={stone3Config.scale}
        type="rock"
        mousePosition={memoizedMousePosition}
        scrollProgress={scrollProgress.progress}
        mouseStrength={stone3Config.mouseStrength}
        isMobile={isMobile}
        blurIntensity={blurIntensity}
      />

      {/* Floating particles for atmosphere */}
      <Particles count={isMobile ? 30 : 80} blurIntensity={blurIntensity * 0.3} />
    </>
  );
}

// Floating gold particles with varied speeds and gentle size pulsing
function Particles({ count, blurIntensity = 0 }: { count: number; blurIntensity?: number }) {
  const meshRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      speeds[i] = 0.3 + Math.random() * 0.7; // varied float speed per particle
    }

    return [positions, speeds];
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const posAttr = meshRef.current.geometry.attributes.position;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const y = posAttr.getY(i);
      const speed = speeds[i];

      // Float upward with individual speed + sine wobble
      let newY = y + speed * 0.003 * (1 - blurIntensity * 0.5);
      // Horizontal wobble
      const x = posAttr.getX(i);
      const wobble = Math.sin(time * 0.3 + i * 1.7) * 0.001;
      posAttr.setX(i, x + wobble);

      if (newY > 12) newY = -12;
      posAttr.setY(i, newY);
    }

    posAttr.needsUpdate = true;
    meshRef.current.rotation.y = time * 0.015 * (1 - blurIntensity * 0.3);
  });

  // Gentle size pulsing
  const particleSize = 0.15 + blurIntensity * 0.1;

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={particleSize}
        color="#FFD700"
        transparent
        opacity={0.7 - blurIntensity * 0.2}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
