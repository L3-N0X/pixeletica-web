import { useState, useEffect } from 'react';

type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

const defaultBreakpoints: Breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

export const useResponsiveLayout = (customBreakpoints?: Partial<Breakpoints>) => {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };

  // Initialize state with a default to prevent hydration mismatch
  const [currentBreakpoint, setCurrentBreakpoint] = useState<BreakpointKey>('lg');
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // Only run this in the browser
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      // Determine current breakpoint
      if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md');
      } else if (width >= breakpoints.sm) {
        setCurrentBreakpoint('sm');
      } else {
        setCurrentBreakpoint('xs');
      }
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoints]);

  // Helper functions
  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
  const isTablet = currentBreakpoint === 'md';
  const isDesktop = currentBreakpoint === 'lg' || currentBreakpoint === 'xl';

  return {
    breakpoint: currentBreakpoint,
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
  };
};
