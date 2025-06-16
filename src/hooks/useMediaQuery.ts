import { useState, useEffect } from 'react';

/**
 * Custom hook that tells if a particular media query is active
 * 
 * @param query The media query to check
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Only run this on the client side
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    
    // Update the state initially
    setMatches(media.matches);
    
    // Set up the callback to update state when matches change
    const listener = () => setMatches(media.matches);
    
    // Modern browsers
    media.addEventListener('change', listener);
    
    // Clean up
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}

/**
 * Convenience hook that tells if the current viewport is a mobile device
 * 
 * @returns Boolean indicating if the viewport is mobile-sized
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}
