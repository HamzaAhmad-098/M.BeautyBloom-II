import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Initialize Google Analytics
const initializeGA = () => {
  const script1 = document.createElement('script');
  script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-40P987J500';
  script1.async = true;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-YOUR_MEASUREMENT_ID');
  `;
  document.head.appendChild(script2);
};

// Track page views
const trackPageView = (url) => {
  if (window.gtag) {
    window.gtag('config', 'G-YOUR_MEASUREMENT_ID', {
      page_path: url,
    });
  }
};

// Track events
export const trackEvent = (action, category, label, value) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA on first load
    if (!window.gtag) {
      initializeGA();
    }
    
    // Track page view on route change
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
};

export default GoogleAnalytics;