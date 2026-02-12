'use client';

import { useState, useEffect, useCallback } from 'react';

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number; // -1 to 1
  normalizedY: number; // -1 to 1
}

export function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  const updateMousePosition = useCallback((e: MouseEvent) => {
    const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
    const normalizedY = -(e.clientY / window.innerHeight) * 2 + 1;

    setMousePosition({
      x: e.clientX,
      y: e.clientY,
      normalizedX,
      normalizedY,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, [updateMousePosition]);

  return mousePosition;
}
