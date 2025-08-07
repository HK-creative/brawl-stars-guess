import { useEffect } from 'react';

/**
 * Sets the browser tab title while the component is mounted.
 * Falls back to the previous title on unmount.
 */
export default function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;

    return () => {
      document.title = previous;
    };
  }, [title]);
}
