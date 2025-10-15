import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface UseBreakpointReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  currentBreakpoint: Breakpoint;
}

/**
 * Hook to detect the current breakpoint based on window width
 * Mobile/Tablet: < 1024px (tablets seguem padrão mobile)
 * Desktop: >= 1024px
 * 
 * Uses debounced resize events for better performance
 */
export function useBreakpoint(): UseBreakpointReturn {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events for better performance
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        let newBreakpoint: Breakpoint;
        
        if (width < 768) {
          newBreakpoint = 'mobile';
        } else if (width < 1024) {
          newBreakpoint = 'tablet';
        } else {
          newBreakpoint = 'desktop';
        }

        if (newBreakpoint !== breakpoint) {
          setBreakpoint(newBreakpoint);
        }
      }, 150); // 150ms debounce delay
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    currentBreakpoint: breakpoint,
  };
}
