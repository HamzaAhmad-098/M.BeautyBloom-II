import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Home = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white animate-fade-in">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-500 to-primary-700 text-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 animate-scale-in">
            M.BeautyBloom
          </h1>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Discover the finest beauty products for your skincare, makeup, and haircare needs
          </p>
          <Link
            to="/shop"
            className="inline-block bg-white text-primary-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 mobile-tap-target animate-float"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            Why Choose Our Store?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'On orders above Rs. 2000' },
              { icon: '💯', title: '100% Authentic', desc: 'Guaranteed genuine products' },
              { icon: '📞', title: '24/7 Support', desc: 'Dedicated customer service' },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-primary-500 text-4xl mb-4 animate-bounce-slow">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="py-12 sm:py-16 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: '🧴', name: 'Skincare', category: 'skincare' },
              { icon: '💄', name: 'Makeup', category: 'makeup' },
              { icon: '💇‍♀️', name: 'Haircare', category: 'haircare' },
              { icon: '🌸', name: 'Fragrance', category: 'fragrance' },
            ].map((cat, index) => (
              <Link
                key={cat.category}
                to={`/shop?category=${cat.category}`}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 mobile-tap-target"
              >
                <div className="text-3xl sm:text-4xl mb-2">{cat.icon}</div>
                <h3 className="font-bold text-sm sm:text-base">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { text: "Best cosmetics store in Pakistan! The products are genuine and delivery is super fast.", author: "Sarah K." },
              { text: "Amazing collection and excellent customer service. Highly recommended!", author: "Ayesha M." },
              { text: "The quality of products is exceptional. Will definitely shop again!", author: "Fatima R." },
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center mb-4">
                  <span className="text-yellow-400 text-xl">★★★★★</span>
                </div>
                <p className="text-gray-700 mb-4 text-sm sm:text-base">
                  "{testimonial.text}"
                </p>
                <p className="font-bold text-gray-900">- {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Stay Updated
          </h2>
          <p className="mb-6 text-pink-100">
            Subscribe to our newsletter for exclusive offers and beauty tips
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white text-sm sm:text-base"
            />
            <button
              type="submit"
              className="bg-white text-pink-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors mobile-tap-target"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;