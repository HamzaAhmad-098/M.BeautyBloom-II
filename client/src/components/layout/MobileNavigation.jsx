import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaHome, 
  FaShoppingBag, 
  FaUser, 
  FaHeart, 
  FaShoppingCart,
  FaBoxOpen // Add this import
} from 'react-icons/fa';

const MobileNavigation = () => {
  const [activeTab, setActiveTab] = useState('');
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTab('home');
    else if (path.startsWith('/shop')) setActiveTab('shop');
    else if (path.startsWith('/wishlist')) setActiveTab('wishlist');
    else if (path.startsWith('/cart')) setActiveTab('cart');
    else if (path.startsWith('/orders')) setActiveTab('orders'); // Add this line
    else if (path.startsWith('/profile')) setActiveTab('profile');
  }, [location]);

  const navItems = [
    { id: 'home', label: 'Home', icon: <FaHome />, link: '/' },
    { id: 'shop', label: 'Shop', icon: <FaShoppingBag />, link: '/shop' },
    { id: 'wishlist', label: 'Wishlist', icon: <FaHeart />, link: '/wishlist' },
    { id: 'orders', label: 'Orders', icon: <FaBoxOpen />, link: '/orders' }, // Add this item
    { id: 'cart', label: 'Cart', icon: <FaShoppingCart />, link: '/cart' },
    { id: 'profile', label: userInfo ? 'Profile' : 'Login', icon: <FaUser />, link: userInfo ? '/profile' : '/login' },
  ];

  const cartItemsCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-bottom animate-fade-in shadow-lg">
        <div className="grid grid-cols-6 gap-1 px-2 py-3">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all duration-300 mobile-tap-target ${
                activeTab === item.id
                  ? 'text-primary-500 bg-primary-50 transform scale-105'
                  : 'text-gray-600 hover:text-primary-500'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="relative text-lg">
                {item.icon}
                {item.id === 'cart' && cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartItemsCount > 9 ? '9+' : cartItemsCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium text-center">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Add padding to content for fixed bottom nav */}
      <style jsx>{`
        @supports (padding: max(0px)) {
          .safe-bottom {
            padding-bottom: max(env(safe-area-inset-bottom), 16px);
          }
        }
      `}</style>
    </>
  );
};

export default MobileNavigation;