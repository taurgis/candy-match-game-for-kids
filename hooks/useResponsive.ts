import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768; // md breakpoint
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    
    // Check on mount in case initial calculation was wrong
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile };
};
