import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (isMobile) {
        // For mobile, scroll all possible containers
        const containers = [
          document.documentElement,
          document.body,
          document.querySelector('main'),
          document.querySelector('#root'),
          window
        ];
        
        containers.forEach(container => {
          if (container && container.scrollTo) {
            try {
              container.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant' // Use 'instant' for immediate scroll
              });
            } catch (e) {
              // Fallback
              if (typeof container.scrollTop !== 'undefined') {
                container.scrollTop = 0;
              }
            }
          }
        });
      } else {
        // For desktop, smooth scroll
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }
    }, 50); // Small delay to ensure route change is complete

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};

export default ScrollToTop;