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
  blurIntensity?: number; // New prop for blur effect
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
      // Adjust camera position based on scroll and blur intensity
      const targetZ = 10 - scrollProgress.progress * 2 + blurIntensity * 3;
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.02);
      
      // Also adjust field of view for depth effect
      camera.fov = THREE.MathUtils.lerp(camera.fov, 50 + blurIntensity * 15, 0.01);
      camera.updateProjectionMatrix();
    } else {
      // For mobile, adjust differently
      camera.fov = THREE.MathUtils.lerp(camera.fov, 60 + blurIntensity * 10, 0.01);
      camera.updateProjectionMatrix();
    }
  });

  // Stone configurations
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

  return (
    <>
      {/* Lighting setup */}
      <Lights mousePosition={memoizedMousePosition} />

      {/* Fallback lighting in case environment map doesn't load */}
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

      {/* Floating particles for atmosphere - keep particles prominent regardless of blur */}
      <Particles count={isMobile ? 20 : 40} blurIntensity={blurIntensity * 0.3} />
    </>
  );
}

// Floating gold particles
function Particles({ count, blurIntensity = 0 }: { count: number, blurIntensity?: number }) {
  const meshRef = useRef<THREE.Points>(null);

  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      sizes[i] = Math.random() * 0.5 + 0.1;
    }

    return [positions, sizes];
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const positionAttribute = meshRef.current.geometry.attributes.position;

    for (let i = 0; i < count; i++) {
      const y = positionAttribute.getY(i);
      const time = state.clock.elapsedTime;

      // Float upward with variation based on blur intensity
      let newY = y + Math.sin(time * 0.5 + i) * 0.002 * (1 - blurIntensity * 0.5);

      // Reset if too high
      if (newY > 10) newY = -10;

      positionAttribute.setY(i, newY);
    }

    positionAttribute.needsUpdate = true;
    // Rotate slower as blur increases
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.02 * (1 - blurIntensity * 0.3);
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2 * (1 + blurIntensity * 0.5)} // Increase size more as blur increases
        color="#FFD700"
        transparent
        opacity={0.8 - blurIntensity * 0.3} // Reduce opacity as blur increases
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
