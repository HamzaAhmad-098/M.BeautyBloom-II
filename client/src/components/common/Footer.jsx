import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaPhone, FaEnvelope, FaMapMarkerAlt, FaArrowUp } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { SiTiktok } from 'react-icons/si';

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const scrollToTop = () => {
    if (isMobile) {
      // Scroll main content container on mobile
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }
    }
    
    // Always scroll window
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  // Function to handle all footer link clicks
  const handleFooterLinkClick = () => {
    // Small delay to ensure route change happens first
    setTimeout(scrollToTop, 100);
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'FAQ', path: '/faq' },
  ];

  const customerService = [
    { name: 'Track Your Order', path: '/track-order' },
    { name: 'Shipping Policy', path: '/shipping' },
    { name: 'Return Policy', path: '/returns' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms & Conditions', path: '/terms' },
  ];

  const categories = [
    { name: 'Rose Bouquets', path: '/shop?category=rose-bouquets' },
    { name: 'Money Bouquets', path: '/shop?category=money-bouquets' },
    { name: 'Cake Bouquets', path: '/shop?category=cake-bouquets' },
    { name: 'Chocolate Boxes', path: '/shop?category=chocolate-boxes' },
  ];

  return (
    <footer className="bg-ink-900 text-white pt-12 pb-6 animate-fade-in">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 sm:right-8 z-40 bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 animate-float mobile-tap-target"
          aria-label="Scroll to top"
        >
          <FaArrowUp />
        </button>
      )}

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center animate-bounce-slow">
                <span className="text-white font-bold text-2xl">🎁</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold font-display">M.BeautyBloom</h2>
                <p className="text-sm text-gray-400">by Beauty Bloom</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">
              Handmade rose bouquets, money bouquets, cake bouquets, chocolate boxes & personalized gifts for every occasion.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/manibhai_000?igsh=dW13M2UzdnR6ajFn" className="text-gray-400 hover:text-white transition-colors p-2">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors p-2">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors p-2">
                <FaYoutube size={20} />
              </a>
              <a href="https://tiktok.com/@mani_gifts_store" className="text-gray-400 hover:text-white transition-colors p-2">
                <SiTiktok size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={handleFooterLinkClick}
                    className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {customerService.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={handleFooterLinkClick}
                    className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-400">
                <FaPhone className="text-primary-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">03214203402</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <FaEnvelope className="text-primary-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">hamzaxdevelopers1223@gmail.com</span>
              </li>
              <li className="flex items-start space-x-3 text-gray-400">
                <FaMapMarkerAlt className="text-primary-500 mt-1 flex-shrink-0" />
                <span className="text-sm sm:text-base">
                  Urdu Bazaar Near Goga Fabrics, Kasur  <br />Punjab Pakistan
                </span>
              </li>
            </ul>
        
            <div className="border-t border-gray-800 mt-8 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-gray-400 text-sm text-center md:text-left">
                  © {new Date().getFullYear()} Powered by HamzaxDevelopers. All rights reserved. (Contact: 03297474472)
                </p>
                <div className="flex items-center flex-wrap justify-center gap-4">
                  <div className="text-xs bg-gray-800 px-2 py-1 rounded">COD</div>
                  <div className="text-xs bg-gray-800 px-2 py-1 rounded">JazzCash</div>
                  <div className="text-xs bg-gray-800 px-2 py-1 rounded">Easypaisa</div>
                  <div className="text-xs bg-gray-800 px-2 py-1 rounded">Card</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-3">Newsletter</h4>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                />
                <button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-md font-medium whitespace-nowrap text-sm sm:text-base mobile-tap-target"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;