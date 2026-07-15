import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { useState } from 'react';

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { itemsCount } = useSelector((state) => state.cart);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mobile-tap-target"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
            </button>
            
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
            >
              {/* Enhanced Logo Container */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary-200">
                {/* Background shimmer effect while loading */}
                {!logoLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-primary-200 animate-pulse"></div>
                )}
                
                {/* Logo Image - Full Size */}
                <img
                  src="/logo.jpeg"
                  alt="Mani Gift Center by Beauty Bloom"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setLogoLoaded(true)}
                  onError={(e) => {
                    console.error('Logo failed to load:', e);
                    e.target.style.display = 'none';
                  }}
                  loading="eager"
                  decoding="async"
                />
                
                {/* Hover Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Decorative Ring */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-300 rounded-full transition-all duration-300"></div>
              </div>

              {/* Website Name and Tagline */}
              <div className="hidden sm:block transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-xl sm:text-2xl font-bold font-display bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:to-primary-600 transition-all duration-500">
                  Mani Gift Center
                </h1>
                <div className="flex items-center space-x-1">
                  <p className="text-xs text-gray-500 -mt-1 group-hover:text-primary-500 transition-colors duration-300">
                    by Beauty Bloom
                  </p>
                  <span className="text-xs text-primary-400 group-hover:animate-pulse">🎁</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link 
              to="/" 
              className="relative text-gray-700 hover:text-pink-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-pink-50 group"
            >
              Home
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-pink-500 group-hover:w-4/5 transition-all duration-300"></span>
            </Link>
            <Link 
              to="/shop" 
              className="relative text-gray-700 hover:text-pink-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-pink-50 group"
            >
              Shop
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-pink-500 group-hover:w-4/5 transition-all duration-300"></span>
            </Link>
            <Link 
              to="/about" 
              className="relative text-gray-700 hover:text-pink-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-pink-50 group"
            >
              About
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-pink-500 group-hover:w-4/5 transition-all duration-300"></span>
            </Link>
            <Link 
              to="/contact" 
              className="relative text-gray-700 hover:text-pink-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-pink-50 group"
            >
              Contact
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-pink-500 group-hover:w-4/5 transition-all duration-300"></span>
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search Button */}
            <Link 
              to="/shop" 
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors mobile-tap-target group"
              aria-label="Search"
            >
              <FaSearch className="text-gray-700 h-5 w-5 group-hover:text-pink-600 transition-colors" />
            </Link>
            
            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors mobile-tap-target group"
            >
              <FaShoppingCart className="text-gray-700 h-5 w-5 sm:h-6 sm:w-6 group-hover:text-pink-600 transition-colors" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-scale-in shadow-md group-hover:scale-110 transition-transform">
                  {itemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {userInfo ? (
              <div className="flex items-center space-x-2">
                <span className="text-gray-700 hidden md:block text-sm">Hi, {userInfo.name}</span>
                <Link
                  to="/profile"
                  className="p-2 rounded-full hover:bg-gray-100 mobile-tap-target group"
                >
                  <FaUser className="text-gray-700 h-5 w-5 group-hover:text-pink-600 transition-colors" />
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="relative px-3 py-2 text-gray-700 hover:text-pink-600 font-medium text-sm sm:text-base group overflow-hidden"
                >
                  Login
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/register"
                  className="relative px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300 text-sm sm:text-base mobile-tap-target group overflow-hidden"
                >
                  <span className="relative z-10">Register</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu - Animated Slide In */}
        <div className={`lg:hidden ${isMenuOpen ? 'block' : 'hidden'} animate-slide-in`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t mt-2">
            <Link
              to="/"
              className="block px-3 py-3 rounded-lg text-gray-700 hover:text-pink-600 hover:bg-pink-50 font-medium transition-colors flex items-center space-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img 
                  src="/logo.jpeg" 
                  alt="Mani Gift Center" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span>Home</span>
            </Link>
            <Link
              to="/shop"
              className="block px-3 py-3 rounded-lg text-gray-700 hover:text-pink-600 hover:bg-pink-50 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="block px-3 py-3 rounded-lg text-gray-700 hover:text-pink-600 hover:bg-pink-50 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-3 rounded-lg text-gray-700 hover:text-pink-600 hover:bg-pink-50 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            {/* Mobile Auth Buttons */}
            {!userInfo && (
              <div className="pt-4 border-t">
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-3 mb-2 border-2 border-pink-500 text-pink-500 rounded-lg font-medium hover:bg-pink-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;