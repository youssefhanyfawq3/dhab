import { useState, useEffect, useRef } from 'react';

export function useScrollBlur() {
  const [blurIntensity, setBlurIntensity] = useState(0);
  const currentIntensity = useRef(0);
  const targetIntensity = useRef(0);
  
  useEffect(() => {
    let animationFrameId: number;
    
    const handleScroll = () => {
      // Calculate scroll progress as a value between 0 and 1
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      
      // Map scroll progress to blur intensity (0 to 1)
      // Using a smooth easing function for more natural feel
      const easedProgress = Math.pow(scrollProgress, 1.5); // Slightly less aggressive than quadratic
      targetIntensity.current = Math.min(easedProgress * 0.8, 0.6); // More pronounced blur - cap at 0.6
    };

    const smoothUpdate = () => {
      // Smoothly interpolate towards the target intensity
      const diff = targetIntensity.current - currentIntensity.current;
      if (Math.abs(diff) > 0.001) { // Only update if difference is significant
        currentIntensity.current += diff * 0.1; // 10% step towards target
        setBlurIntensity(Math.max(0, currentIntensity.current)); // Ensure non-negative
      }
      animationFrameId = requestAnimationFrame(smoothUpdate);
    };

    // Initial calculation
    handleScroll();
    currentIntensity.current = targetIntensity.current;
    setBlurIntensity(targetIntensity.current);
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Start smooth animation loop
    animationFrameId = requestAnimationFrame(smoothUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return { blurIntensity };
}