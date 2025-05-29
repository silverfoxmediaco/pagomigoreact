// src/hooks/useParallax.js
import { useEffect, useRef, useState } from 'react';

export const useParallax = (speed = 0.5, offset = 0) => {
  const elementRef = useRef(null);
  const [transform, setTransform] = useState('translateY(0px)');

  useEffect(() => {
    let ticking = false;

    const updateParallax = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const windowHeight = window.innerHeight;
      
      // Only calculate parallax if element is in viewport
      if (rect.bottom >= 0 && rect.top <= windowHeight) {
        const yPos = -(scrolled * speed) + offset;
        setTransform(`translateY(${yPos}px)`);
      }
      
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    // Initial calculation
    updateParallax();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateParallax, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateParallax);
    };
  }, [speed, offset]);

  return { elementRef, transform };
};

// Hook for background parallax
export const useBackgroundParallax = (speed = 0.3) => {
  const containerRef = useRef(null);
  const [backgroundPosition, setBackgroundPosition] = useState('50% 0%');

  useEffect(() => {
    let ticking = false;

    const updateBackground = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const windowHeight = window.innerHeight;
      
      // Only update if element is near viewport
      if (rect.bottom >= -100 && rect.top <= windowHeight + 100) {
        const yPos = scrolled * speed;
        setBackgroundPosition(`50% ${yPos}px`);
      }
      
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateBackground);
        ticking = true;
      }
    };

    updateBackground();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateBackground, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateBackground);
    };
  }, [speed]);

  return { containerRef, backgroundPosition };
};