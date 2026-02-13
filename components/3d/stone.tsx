'use client';

import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface StoneProps {
  position: [number, number, number];
  scale?: number;
  type: 'rock' | 'crystal';
  mousePosition: { normalizedX: number; normalizedY: number };
  scrollProgress: number;
  mouseStrength?: number;
  isMobile?: boolean;
  blurIntensity?: number; // New prop for blur effect
}

export function Stone({
  position,
  scale = 1,
  type,
  mousePosition,
  scrollProgress,
  mouseStrength = 0.3,
  isMobile = false,
  blurIntensity = 0, // Default value for blur intensity
}: StoneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const originalPosition = useMemo(() => new THREE.Vector3(...position), [position]);
  const targetRotation = useRef({ x: 0, y: 0 });
  const isAnimating = useRef(false);
  const opacity = Math.max(0.85, 0.98 - blurIntensity * 0.15);
  const isTransparent = opacity < 0.999;

  // Apply noise displacement for rock-like appearance
  const geometry = useMemo(() => {
    const detail = isMobile ? 1 : 3;

    if (type === 'rock') {
      const geo = new THREE.IcosahedronGeometry(1, detail);
      const pos = geo.attributes.position;
      const vector = new THREE.Vector3();

      // Simple noise displacement with NaN protection
      for (let i = 0; i < pos.count; i++) {
        vector.fromBufferAttribute(pos, i);
        
        // Check for NaN values before computation
        if (isNaN(vector.x) || isNaN(vector.y) || isNaN(vector.z)) {
          continue; // Skip this vertex if it contains NaN
        }
        
        const noise = Math.sin(vector.x * 3) * Math.cos(vector.y * 3) * Math.sin(vector.z * 3);
        const displacement = 1 + noise * 0.15;
        
        // Ensure displacement is finite
        if (isFinite(displacement)) {
          vector.multiplyScalar(displacement);
          pos.setXYZ(i, vector.x, vector.y, vector.z);
        }
      }

      geo.computeVertexNormals();
      return geo;
    } else {
      const geo = new THREE.DodecahedronGeometry(1, detail);
      const pos = geo.attributes.position;
      const vector = new THREE.Vector3();

      // Sharper edges for crystal with NaN protection
      for (let i = 0; i < pos.count; i++) {
        vector.fromBufferAttribute(pos, i);
        
        // Check for NaN values before computation
        if (isNaN(vector.x) || isNaN(vector.y) || isNaN(vector.z)) {
          continue; // Skip this vertex if it contains NaN
        }
        
        const noise = Math.sin(vector.x * 5) * Math.cos(vector.y * 5);
        const displacement = 1 + noise * 0.08;
        
        // Ensure displacement is finite
        if (isFinite(displacement)) {
          vector.multiplyScalar(displacement);
          pos.setXYZ(i, vector.x, vector.y, vector.z);
        }
      }

      geo.computeVertexNormals();
      return geo;
    }
  }, [type, isMobile]);

  // Mouse follow animation
  useFrame((state) => {
    if (!meshRef.current || isAnimating.current) return;

    // Smooth rotation toward mouse
    targetRotation.current.x = mousePosition.normalizedY * mouseStrength;
    targetRotation.current.y = mousePosition.normalizedX * mouseStrength;

    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetRotation.current.x,
      0.05
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotation.current.y + scrollProgress * 0.5,
      0.05
    );

    // Subtle idle animation
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;

    // Scroll-based position
    if (type === 'rock') {
      const scrollOffsetX = (scrollProgress - 0.5) * 8;
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x,
        originalPosition.x + scrollOffsetX,
        0.03
      );
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        originalPosition.y,
        0.03
      );
    } else {
      const scrollOffsetY = (scrollProgress - 0.5) * -6;
      const scrollScale = 0.8 + scrollProgress * 0.4;
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        originalPosition.y + scrollOffsetY,
        0.03
      );
      const currentScale = meshRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, scale * scrollScale, 0.03);
      meshRef.current.scale.setScalar(newScale);
    }
  });

  // Click interaction
  const handleClick = useCallback(() => {
    if (!meshRef.current || isAnimating.current) return;

    isAnimating.current = true;

    if (type === 'rock') {
      // Spin animation
      gsap.to(meshRef.current.rotation, {
        y: meshRef.current.rotation.y + Math.PI * 2,
        duration: 1.5,
        ease: 'power2.out',
      });

      // Glow pulse
      if (materialRef.current) {
        const originalEmissive = materialRef.current.emissiveIntensity;
        gsap.to(materialRef.current, {
          emissiveIntensity: 1,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            if (materialRef.current) {
              materialRef.current.emissiveIntensity = originalEmissive;
            }
            isAnimating.current = false;
          },
        });
      } else {
        setTimeout(() => {
          isAnimating.current = false;
        }, 1500);
      }
    } else {
      // Jump animation
      const originalY = meshRef.current.position.y;

      gsap.to(meshRef.current.position, {
        y: originalY + 1.5,
        duration: 0.4,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          isAnimating.current = false;
        },
      });

      // Scale bounce
      gsap.to(meshRef.current.scale, {
        x: scale * 1.1,
        y: scale * 1.1,
        z: scale * 1.1,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
      });
    }
  }, [type, scale]);

  // Hover effect
  const handlePointerOver = useCallback(() => {
    if (!meshRef.current || isAnimating.current) return;
    document.body.style.cursor = 'pointer';

    gsap.to(meshRef.current.scale, {
      x: scale * 2,
      y: scale * 2,
      z: scale * 2,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [scale]);

  const handlePointerOut = useCallback(() => {
    if (!meshRef.current || isAnimating.current) return;
    document.body.style.cursor = 'auto';

    gsap.to(meshRef.current.scale, {
      x: scale,
      y: scale,
      z: scale,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [scale]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      scale={scale}
      castShadow
      receiveShadow
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <meshPhysicalMaterial
        ref={materialRef}
        color={type === 'rock' ? 0xFFD700 : 0xFFD700} /* Both stones should have gold color */
        metalness={type === 'rock' ? 0.95 : 0.98} /* More metallic for both */
        roughness={type === 'rock' ? 0.25 + blurIntensity * 0.3 : 0.15 + blurIntensity * 0.2} /* Increase roughness with blur */
        emissive={type === 'crystal' ? 0xFFD700 : 0x000000}
        emissiveIntensity={type === 'crystal' ? 0.3 - blurIntensity * 0.1 : 0.05 - blurIntensity * 0.05} /* Reduce glow with blur */
        envMapIntensity={2.5 * (1 - blurIntensity * 0.4)} /* Reduce reflections with blur */
        clearcoat={0.7 * (1 - blurIntensity * 0.3)} /* Reduce clearcoat with blur */
        clearcoatRoughness={0.05 + blurIntensity * 0.15} /* Increase clearcoat roughness with blur */
        opacity={opacity} /* Reduce opacity with blur */
        transparent={isTransparent}
        // Add more noise/displacement effect
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
