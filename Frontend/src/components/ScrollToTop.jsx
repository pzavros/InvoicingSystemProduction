import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that automatically scrolls to the top of the page
 * when the route changes in a React Router application.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the top of the page when the pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Optional: adds smooth scrolling animation
    });
  }, [pathname]);

  // This component doesn't render anything
  return null;
}

export default ScrollToTop;
