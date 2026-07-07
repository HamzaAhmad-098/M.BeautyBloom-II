import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import MobileNavigation from '../layout/MobileNavigation';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

const Layout = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Update body classes for mobile detection
      if (mobile) {
        document.body.classList.add('is-mobile');
        document.documentElement.style.overflowY = 'auto';
        document.body.style.overflowY = 'auto';
      } else {
        document.body.classList.remove('is-mobile');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.body.classList.remove('is-mobile');
      document.documentElement.style.overflowY = '';
      document.body.style.overflowY = '';
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Mobile Navigation (Bottom Bar) */}
      {isMobile && <MobileNavigation />}
      
      {/* Main Content - CRITICAL: Remove overflow-y-auto here */}
      <main className={`flex-grow w-full ${isMobile ? 'pb-16' : ''}`}>
        <div className="w-full max-w-full overflow-x-hidden">
          <Outlet />
        </div>
      </main>
      
      <Footer />
      
      <Toaster 
        position={isMobile ? "top-center" : "top-right"}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: isMobile ? '14px' : '16px',
            maxWidth: isMobile ? '90vw' : '400px',
            borderRadius: '8px',
            padding: isMobile ? '12px' : '16px',
          },
          success: {
            style: {
              background: '#10b981',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
        }}
      />
    </div>
  );
};

export default Layout;