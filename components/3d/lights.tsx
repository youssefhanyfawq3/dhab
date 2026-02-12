'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LightsProps {
  mousePosition: { normalizedX: number; normalizedY: number };
}

export function Lights({ mousePosition }: LightsProps) {
  const mainLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);
  const backlightRef = useRef<THREE.PointLight>(null);

  // Dynamic light movement + subtle color temperature shift
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (mainLightRef.current) {
      mainLightRef.current.position.x = THREE.MathUtils.lerp(
        mainLightRef.current.position.x,
        5 + mousePosition.normalizedX * 3,
        0.02
      );
      mainLightRef.current.position.y = THREE.MathUtils.lerp(
        mainLightRef.current.position.y,
        10 + mousePosition.normalizedY * 2,
        0.02
      );

      // Subtle animated color temperature shift (gold → warm gold → gold)
      const hue = 0.12 + Math.sin(time * 0.15) * 0.02; // oscillate around gold hue
      mainLightRef.current.color.setHSL(hue, 0.9, 0.55);
    }

    if (rimLightRef.current) {
      rimLightRef.current.position.x = THREE.MathUtils.lerp(
        rimLightRef.current.position.x,
        -5 - mousePosition.normalizedX * 2,
        0.02
      );
    }

    // Gentle backlight breathing
    if (backlightRef.current) {
      backlightRef.current.intensity = 1.5 + Math.sin(time * 0.4) * 0.3;
    }
  });

  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.5} color="#FFD700" />

      {/* Main directional light (sun-like) with animated color */}
      <directionalLight
        ref={mainLightRef}
        position={[5, 10, 7]}
        intensity={3.0}
        color="#FFD700"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.001}
      />

      {/* Gold rim light for edge highlights */}
      <pointLight
        ref={rimLightRef}
        position={[-5, 2, -5]}
        intensity={2.0}
        color="#FFD700"
        distance={25}
        decay={2}
      />

      {/* Warm fill light */}
      <pointLight
        position={[5, -3, 5]}
        intensity={1.2}
        color="#FFA500"
        distance={20}
        decay={2}
      />

      {/* Cool accent light for contrast */}
      <pointLight
        position={[0, 5, -8]}
        intensity={0.3}
        color="#4169E1"
        distance={25}
        decay={2}
      />

      {/* Warm backlight — soft orange glow behind the scene */}
      <pointLight
        ref={backlightRef}
        position={[0, -2, -10]}
        intensity={1.5}
        color="#FF8C00"
        distance={30}
        decay={2}
      />
    </>
  );
}
