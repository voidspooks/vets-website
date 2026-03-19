import { useEffect, useState } from 'react';

/**
 * Custom hook to track media query matches
 * @param {string} query - Media query string (e.g., '(min-width: 768px)')
 * @returns {boolean} Whether the media query currently matches
 */
const useMediaQuery = query => {
  const [matches, setMatches] = useState(
    () =>
      typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(
    () => {
      if (typeof window === 'undefined') return null;

      const mediaQuery = window.matchMedia(query);
      const handler = e => setMatches(e.matches);

      // Use modern API with fallback for older browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }

      // Fallback for Safari < 14, Chrome < 45
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    },
    [query],
  );

  return matches;
};

export default useMediaQuery;
