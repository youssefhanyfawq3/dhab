'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface ScrollProgress {
  progress: number; // 0 to 1
  scrollY: number;
  maxScroll: number;
  isScrolling: boolean;
}

export function useScrollProgress(): ScrollProgress {
  const [scrollProgress, setScrollProgress] = useState<ScrollProgress>({
    progress: 0,
    scrollY: 0,
    maxScroll: 0,
    isScrolling: false,
  });

  // Use ref for timeout to avoid dependency issues
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateScrollProgress = useCallback(() => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

    setScrollProgress({
      progress,
      scrollY,
      maxScroll,
      isScrolling: true,
    });

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set new timeout to mark scrolling as stopped
    scrollTimeoutRef.current = setTimeout(() => {
      setScrollProgress((prev) => ({ ...prev, isScrolling: false }));
    }, 150);
  }, []); // No dependencies needed now

  useEffect(() => {
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
    
    // Initial calculation
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [updateScrollProgress]);

  return scrollProgress;
}
